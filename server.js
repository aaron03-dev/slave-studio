const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;
const AdmZip = require('adm-zip'); // Add this dependency
const ftp =  require('basic-ftp');
const axios = require('axios');
const fsPromises = require('fs').promises;
const fs = require('fs')
const path = require('path');
const fsExtra = require("fs-extra");
const { exec } = require('child_process');
const util = require('util');
const StreamZip = require('node-stream-zip');

app.use(cors());
app.use(express.json());

let completedSlaves = []; // Lưu trạng thái các slave theo IP

// Nhận trạng thái từ slave
app.post('/slave-status', (req, res) => {
    const { slaveIp, status, folderName } = req.body;
    console.log(`📥 Slave ${slaveIp} gửi trạng thái: ${status}`);

    if (status === 'done') {
        completedSlaves.push({
            ip: slaveIp,
            done: true,
            folder: folderName,
            status: 'waiting'
        });
    }

    res.status(200).json({ message: 'Master đã nhận trạng thái.' });
});

// Trả về danh sách slave đã xong
app.get('/completed-slaves', (req, res) => {
    res.json(completedSlaves);
});

// Route tải thư mục từ slave
app.get('/download', async (req, res) => {
    const slaveIp = req.query.ip; // Ví dụ: /download?ip=192.168.1.10
    const folder = req.query.folder
    console.log(slaveIp, folder)
    if (!slaveIp) {
        return res.status(400).json({ error: 'Thiếu IP của slave' });
    }

    try {
        await downloadFolderFromSlave(slaveIp, folder);
        res.status(200).json({ message: 'Tải thư mục thành công từ slave ' + slaveIp });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi tải thư mục: ' + err.message });
    }
});

async function downloadFolderFromSlave(slaveIp, folder) {
    try {
        const folderName = folder;
        const zipFileName = `${folderName}.zip`;
        const remoteFolder = `D:\\test\\${folderName}`;
        const localZipPath = path.join("D:/save/", zipFileName);
        const extractPath = path.join("D:/test/", folderName);
        console.log(`📦 Tải file: ${zipFileName} từ ${remoteFolder} về ${localZipPath}`);

        // 1. Yêu cầu slave nén thư mục và bật FTP
        console.log(slaveIp);
        await axios.post(`http://${slaveIp}:3002/start-ftp?folder=${encodeURIComponent(remoteFolder)}`);
        console.log(`⚙️ Đã yêu cầu slave bật FTP chia sẻ file ZIP`);

        // 2. Kết nối FTP và tải file ZIP
        const client = new ftp.Client();
        client.ftp.verbose = true;

        await client.access({
            host: slaveIp.replace(/^https?:\/\//, "").split(":")[0],
            port: 2121, // Cổng FTP
            user: "studio",
            password: "",
            secure: false
        });

        console.log(`✅ Đã kết nối FTP tới ${slaveIp}`);

        // Tải file ZIP về máy
        const writeStream = fs.createWriteStream(localZipPath);
        await client.downloadTo(writeStream, zipFileName);
        writeStream.close();
        console.log(`🎉 Đã tải file ZIP thành công từ ${slaveIp}`);

        client.close();

        // 3. Giải nén file ZIP bằng node-stream-zip
        console.log(`📂 Giải nén ${zipFileName} vào ${extractPath}`);
        try {
            // Kiểm tra và tạo thư mục đích nếu chưa tồn tại
            if (!fs.existsSync(extractPath)) {
                fs.mkdirSync(extractPath, { recursive: true });
            }

            // Khởi tạo StreamZip
            const zip = new StreamZip.async({ file: localZipPath });

            // Giải nén toàn bộ file vào extractPath
            await zip.extract(null, extractPath);

            // Đóng file ZIP
            await zip.close();

            console.log(`✅ Đã giải nén thành công`);
        } catch (zipErr) {
            console.error(`❌ Lỗi khi giải nén ${zipFileName}:`, zipErr.message);
            throw zipErr; // Ném lỗi để xử lý ở catch bên ngoài
        }

        const unknownName = folderName.split('_Slave_')[0];
        const targetPath = path.join("D:/save-1/", unknownName);
        console.log(`🔍 Tên chưa biết là: ${unknownName}`);

        // Tạo thư mục đích nếu chưa tồn tại
        if (!fsExtra.existsSync(targetPath)) {
            await fsExtra.mkdir(targetPath, { recursive: true });
            console.log(`📁 Đã tạo thư mục đích: ${targetPath}`);
        }

        // 4. Di chuyển tất cả các thư mục con vào targetPath
        const subFolders = await fsPromises.readdir(extractPath, { withFileTypes: true })
            .then(files => files.filter(dirent => dirent.isDirectory()))
            .then(dirs => dirs.map(dirent => dirent.name));

        if (subFolders.length === 0) {
            console.error(`❌ Không tìm thấy thư mục con trong ${extractPath}`);
            return;
        }

        console.log(`🚚 Di chuyển tất cả các thư mục con từ ${extractPath} vào ${targetPath}`);

        // Di chuyển tất cả các thư mục con vào thư mục mục tiêu
        for (const subFolder of subFolders) {
            const sourcePath = path.join(extractPath, subFolder);
            const destinationPath = path.join(targetPath, subFolder);
v
            // Log trạng thái đường dẫn
            console.log(`🔍 Source path: ${sourcePath}, exists: ${fsExtra.existsSync(sourcePath)}`);
            console.log(`🔍 Destination path: ${destinationPath}, exists: ${fsExtra.existsSync(destinationPath)}`);

            // Di chuyển thư mục con với overwrite
            await fsExtra.move(sourcePath, destinationPath, { overwrite: true });
            console.log(`✅ Đã di chuyển ${subFolder} vào ${destinationPath}`);
        }

        console.log(`✅ Đã di chuyển tất cả các thư mục con thành công vào ${targetPath}`);
    } catch (err) {
        console.error(`❌ Lỗi khi tải file ZIP từ ${slaveIp}:`, err.message);
        console.error(err.stack); // In toàn bộ stack trace để debug
        throw err;
    }
}

//async function downloadFolderFromSlave(slaveIp, folder) {
//    try {
//        const folderName = folder;
//        const zipFileName = `${folderName}.zip`;
//        const remoteFolder = `D:\\test\\${folderName}`;
//        const localZipPath = path.join("D:/save/", zipFileName);
//        const extractPath = path.join("D:/test/", folderName);
//        console.log(`📦 Tải file: ${zipFileName} từ ${remoteFolder} về ${localZipPath}`);

//        // 1. Yêu cầu slave nén thư mục và bật FTP
//        console.log(slaveIp)
//        await axios.post(`http://${slaveIp}:3002/start-ftp?folder=${encodeURIComponent(remoteFolder)}`);
//        console.log(`⚙️ Đã yêu cầu slave bật FTP chia sẻ file ZIP`);

//        // 2. Kết nối FTP và tải file ZIP
//        const client = new ftp.Client();
//        client.ftp.verbose = true;

//        await client.access({
//            host: slaveIp.replace(/^https?:\/\//, "").split(":")[0],
//            port: 2121, // Cổng FTP
//            user: "studio",
//            password: "",
//            secure: false
//        });

//        console.log(`✅ Đã kết nối FTP tới ${slaveIp}`);

//        // Tải file ZIP về máy
//        const writeStream = require("fs").createWriteStream(localZipPath);
//        await client.downloadTo(writeStream, zipFileName);
//        writeStream.close();
//        console.log(`🎉 Đã tải file ZIP thành công từ ${slaveIp}`);

//        client.close();

//        // 3. Giải nén file ZIP
//        console.log(`📂 Giải nén ${zipFileName} vào ${extractPath}`);
//        const zip = new AdmZip(localZipPath);
//        zip.extractAllTo(extractPath, true); // true để overwrite nếu thư mục đã tồn tại
//        console.log(`✅ Đã giải nén thành công`);

//        const unknownName = folderName.split('_Slave_')[0];
//        const targetPath = path.join("D://save-1//", unknownName);
//        console.log(`🔍 Tên chưa biết là: ${unknownName}`);

//        // Tạo thư mục đích nếu chưa tồn tại
//        if (!fsExtra.existsSync(targetPath)) {
//            await fsExtra.mkdir(targetPath, { recursive: true });
//            console.log(`📁 Đã tạo thư mục đích: ${targetPath}`);
//        }

//        // 4. Di chuyển tất cả các thư mục con vào targetPath
//        //const subFolders = await fs.readdir(extractPath, { withFileTypes: true })
//        //    .then(files => files.filter(dirent => dirent.isDirectory()))
//        //    .then(dirs => dirs.map(dirent => dirent.name));

//        const subFolders = await fsPromises.readdir(extractPath, { withFileTypes: true })
//            .then(files => files.filter(dirent => dirent.isDirectory()))
//            .then(dirs => dirs.map(dirent => dirent.name));

//        if (subFolders.length === 0) {
//            console.error(`❌ Không tìm thấy thư mục con trong ${extractPath}`);
//            return;
//        }

//        console.log(`🚚 Di chuyển tất cả các thư mục con từ ${extractPath} vào ${targetPath}`);

//        // Di chuyển tất cả các thư mục con vào thư mục mục tiêu
//        for (const subFolder of subFolders) {
//            const sourcePath = path.join(extractPath, subFolder);
//            const destinationPath = path.join(targetPath, subFolder);

//            // Log trạng thái đường dẫn
//            console.log(`🔍 Source path: ${sourcePath}, exists: ${fsExtra.existsSync(sourcePath)}`);
//            console.log(`🔍 Destination path: ${destinationPath}, exists: ${fsExtra.existsSync(destinationPath)}`);

//            // Di chuyển thư mục con với overwrite
//            await fsExtra.move(sourcePath, destinationPath, { overwrite: true });
//            console.log(`✅ Đã di chuyển ${subFolder} vào ${destinationPath}`);
//        }

//        console.log(`✅ Đã di chuyển tất cả các thư mục con thành công vào ${targetPath}`);
//    } catch (err) {
//        console.error(`❌ Lỗi khi tải file ZIP từ ${slaveIp}:`, err.message);
//        console.error(err.stack); // In toàn bộ stack trace để debug
//        throw err;
//    }
//}

app.post('/create-folder', async (req, res) => {
    const { folderName } = req.body;
    try {
        const folderPath = path.join('D:', folderName);

        if (!fs.existsSync(folderPath)) {
            await fs.promises.mkdir(folderPath, { recursive: true });
            console.log(`📂 Folder created successfully at ${folderPath}`);
        } else {
            console.log(`📁 Folder ${folderName} already exists at ${folderPath}`);
        }

        res.send({ message: 'Folder created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Failed to create folder', error: err.message });
    }
});


const execPromise = util.promisify(exec);

app.post('/convert', async (req, res) => {
    const { fileName } = req.body;

    if (!fileName) {
        return res.status(400).json({ status: 'Error', message: 'fileName is required' });
    }

    try {
        const sourceExe = 'C:\\Users\\Admin\\Documents\\CV.exe';
        const sourceDll = 'C:\\Users\\Admin\\Documents\\opencv_world4110d.dll';
        const targetFolder = path.join('D:\\save-1\\', fileName);
        const targetExe = path.join(targetFolder, 'CV.exe');
        const targetDll = path.join(targetFolder, 'opencv_world4110d.dll');
        const outputFolder = path.join('D:\\converted\\', `${fileName}-converted`);

        const folderExists = await fsPromises.access(targetFolder).then(() => true).catch(() => false);
        if (!folderExists) {
            return res.status(404).json({ status: 'Error', message: `Folder D:\\${fileName} does not exist` });
        }

        await fsPromises.access(sourceExe);
        await fsPromises.access(sourceDll);

        await fsPromises.copyFile(sourceExe, targetExe);
        await fsPromises.copyFile(sourceDll, targetDll);

        await fsPromises.mkdir(outputFolder, { recursive: true });

        // ✅ Chạy file exe
        await execPromise(`"${targetExe}"`, { cwd: targetFolder });

        // ✅ Sau khi chạy xong: tìm các thư mục *_output và gom ảnh vào outputFolder
        const subDirs = await fsPromises.readdir(targetFolder, { withFileTypes: true });

        for (const dirent of subDirs) {
            if (dirent.isDirectory() && dirent.name.endsWith('_output')) {
                const subDirPath = path.join(targetFolder, dirent.name);

                const files = await fsPromises.readdir(subDirPath);
                for (const file of files) {
                    const match = file.match(/-(\d+)\.[a-zA-Z0-9]+$/); // Tìm hậu tố _0, _1, ...
                    if (match) {
                        const suffix = match[1]; // Lấy hậu tố (0, 1,...)
                        const suffixFolder = path.join(outputFolder, `_${suffix}`);
                        await fsPromises.mkdir(suffixFolder, { recursive: true });

                        const src = path.join(subDirPath, file);
                        const dest = path.join(suffixFolder, `${dirent.name}_${file}`); // tránh trùng tên
                        await fsPromises.copyFile(src, dest);
                    }
                }
            }
        }

        res.json({ status: 'Completed', message: 'Conversion and collection completed successfully' });

    } catch (error) {
        console.error('Error in /convert:', error);
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

//app.post('/convert', async (req, res) => {
//    const { fileName } = req.body;

//    if (!fileName) {
//        return res.status(400).json({ status: 'Error', message: 'fileName is required' });
//    }

//    try {
//        // Define paths
//        const sourceExe = 'C:\\Users\\Admin\\Documents\\CV.exe';
//        const sourceDll = 'C:\\Users\\Admin\\Documents\\opencv_world4110d.dll';
//        const targetFolder = path.join('D:\\save-1\\', fileName);
//        const targetExe = path.join(targetFolder, 'CV.exe');
//        const targetDll = path.join(targetFolder, 'opencv_world4110d.dll');
//        const outputFolder = path.join('D:\\converted\\', `${fileName}-converted`);

//        // Check if target folder exists
//        const folderExists = await fsPromises.access(targetFolder).then(() => true).catch(() => false);
//        if (!folderExists) {
//            return res.status(404).json({ status: 'Error', message: `Folder D:\\${fileName} does not exist` });
//        }

//        // Check if source files exist
//        await fsPromises.access(sourceExe);
//        await fsPromises.access(sourceDll);

//        // Copy CV.exe and opencv_world4110d.dll to target folder
//        await fsPromises.copyFile(sourceExe, targetExe);
//        await fsPromises.copyFile(sourceDll, targetDll);

//        // Create output folder
//        await fsPromises.mkdir(outputFolder, { recursive: true });

//        // Run CV.exe in the target folder
//        try {
//            await execPromise(`"${targetExe}"`, { cwd: targetFolder });
//            res.json({ status: 'Completed', message: 'Conversion completed successfully' });
//        } catch (execError) {
//            console.error('Error executing CV.exe:', execError);
//            res.status(500).json({ status: 'Error', message: 'Failed to execute CV.exe' });
//        }

//    } catch (error) {
//        console.error('Error in /convert:', error);
//        res.status(500).json({ status: 'Error', message: error.message });
//    }
//});


app.listen(PORT, () => {
    console.log(`🚀 Master server chạy tại http://localhost:${PORT}`);
});
