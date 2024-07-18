// const xlsx = require('xlsx');
//
// export function generateExcel(emailData, filePath) {
//     // Create a new workbook and add a worksheet
//     const workbook = xlsx.utils.book_new();
//     const worksheet = xlsx.utils.json_to_sheet(emailData);
//
//     // Add the worksheet to the workbook
//     xlsx.utils.book_append_sheet(workbook, worksheet, 'Emails');
//
//     // Write the workbook to a file
//     xlsx.writeFile(workbook, filePath);
//
//     console.log(`Excel file generated successfully: ${filePath}`);
// }
//
// // Example usage:
// const emails = [
//     { 'Email Address': 'pratibha04rao@gmail.com', 'Subject': 'Meeting Reminder', 'Body': 'Dear User, we have a meeting tomorrow...' },
//     { 'Email Address': 'pratibha04rao@gmail.com', 'Subject': 'Special Offer', 'Body': 'Hello, check out our latest offers...' },
//     { 'Email Address': 'pratibha04rao@gmail.com', 'Subject': 'Important Update', 'Body': 'Important update regarding your account...' }
// ];
//
// generateExcel(emails, 'emails.xlsx');

