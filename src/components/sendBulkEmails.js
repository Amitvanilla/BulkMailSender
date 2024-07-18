const nodemailer = require('nodemailer');
const xlsx = require('xlsx');

const sendBulkEmails = async (req, res, io) => {
    try {
        const { buffer } = req.files['excelFilePath'][0];
        const { email, password } = req.body;
        const attachment = req.files['attachment'][0].buffer;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: email,
                pass: password,
            },
        });

        const emails = readExcelFromBuffer(buffer);
        const totalEmails = emails.length;
        const emailStatus = [];

        for (let sentCount = 0; sentCount < totalEmails; sentCount++) {
            const emailInfo = emails[sentCount];
            const { to, subject, text } = emailInfo;

            const mailOptions = {
                from: email,
                to,
                subject,
                text,
                attachments: [
                    {
                        filename: req.files['attachment'][0].originalname,
                        content: attachment,
                    },
                ],
            };
            const progress = Math.floor(((sentCount + 1) / totalEmails) * 100);
            try {
                await transporter.sendMail(mailOptions);
                emailStatus.push({ to, success: true });
                io.emit('progress', { progress, email: to, status: "Success" });
                console.log(`Email sent to ${to}`);
            } catch (error) {
                emailStatus.push({ to, success: false, error: error.message });
                io.emit('progress', { progress, email: to, status: error.message });
                console.error(`Error sending email to ${to}:`, error.message);
            }
        }

        transporter.close();
        res.status(200).json({ message: 'Bulk emails sent successfully.', emailStatus });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

function readExcelFromBuffer(buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const emailData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const [headers, ...data] = emailData;

    const emailIndex = headers.indexOf('Email Address');
    const subjectIndex = headers.indexOf('Subject');
    const textIndex = headers.indexOf('Body');

    return data.map((row) => ({
        to: row[emailIndex],
        subject: row[subjectIndex],
        text: row[textIndex],
    }));
}

module.exports = sendBulkEmails;
