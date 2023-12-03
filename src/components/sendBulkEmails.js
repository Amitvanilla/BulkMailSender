const nodemailer = require('nodemailer');
const xlsx = require('xlsx');
// const {io} = require("socket.io-client");

const sendBulkEmails = async (req, res) => {
    try {
        const { buffer } = req.file;
        this.io = req.io;
        // console.log(req.io)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'amitgupta0719vl@gmail.com',
                pass: '',
            },
        });

        const emails = readExcelFromBuffer(buffer);
        const totalEmails = emails.length;

        let sentCount = 0;

        // Loop through emails and send them
        for (const email of emails) {
            const { to, name, companyName } = email;

            const mailOptions = {
                from: 'amitgupta0719vl@gmail.com',
                to,
                subject:'Job Application For Frontend Developer Role',
                text: `Hi ${name},\n` +
                    "\n" +
                    `I am writing to express my interest in the Frontend Developer role at ${companyName}. With 1.5 years of experience as a Software Development Engineer (SDE), I bring a solid foundation in software development and a proven track record of successfully leading and contributing to impactful projects.\n` +
                    "\n" +
                    "In my recent role at Jio Platforms Ltd, I played a key role in upgrading and modernizing applications to enhance user experience. My responsibilities included enhancing scalability, strengthening security measures, and optimizing server-side operations, resulting in a 50% increase in user engagement. Over the course of my SDE experience, I have consistently demonstrated my ability to drive projects from initiation to delivery.\n" +
                    "\n" +
                    `I am drawn to ${companyName} for its commitment to excellence and innovation in the tech industry. I am eager to contribute my skills in frontend development to further your company's goals. Attached is my resume, and I look forward to the opportunity to discuss how my experiences align with your team's needs.\n` +
                    "\n" +
                    "Thank you for considering my application.\n" +
                    "\n"+
                    "--\n" +  // Signature line
                    "Best regards,\n" +
                    "Amit Kumar Gupta",
                attachments: [
                    {
                        filename: 'Amit-CV.pdf',  // Change this to the actual filename
                        path: './Amit-CV.pdf',  // Change this to the actual path of your resume file
                    },
                ],
            };

            try {
                await transporter.sendMail(mailOptions);
                sentCount++;
                const progress = Math.floor((sentCount / totalEmails) * 100);

                // Send progress update to client
                this.io.emit('progress', progress);

                console.log(`Email sent to ${mailOptions.to}`);
            } catch (error) {
                console.error(`Error sending email to ${mailOptions.to}:`, error.message);
            }
        }

        transporter.close();

        res.status(200).send('Bulk emails sent successfully.');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Function to read Excel file buffer and return email details
function readExcelFromBuffer(buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Assuming the Excel sheet has columns named 'Email Address', 'Subject', and 'Body'
    const emailData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Extract headers and remove them from the data
    const [headers, ...data] = emailData;

    // Find the column indexes for 'Email Address', 'Subject', and 'Body'
    const emailIndex = headers.indexOf('Email Address');
    const subjectIndex = headers.indexOf('Name');
    const bodyIndex = headers.indexOf('Company Name');

    // Map the data to an array of objects with 'to', 'subject', and 'text' properties
    const emails = data.map((row) => ({
        to: row[emailIndex],
        name: row[subjectIndex],
        companyName: row[bodyIndex],
    }));

    return emails;
}

module.exports = sendBulkEmails;
