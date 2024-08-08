import React, { useState, useEffect, useRef } from 'react';
import {
    Button,
    CircularProgress,
    Container,
    TextField,
    Typography,
    Paper,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid,
} from '@mui/material';
import axios from 'axios';
import socket from './socket';
import * as xlsx from 'xlsx';

function App() {
    const [file, setFile] = useState(null);
    const [attachment, setAttachment] = useState(null);
    const [fileName, setFileName] = useState('');
    const [attachmentName, setAttachmentName] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailStatus, setEmailStatus] = useState([]);

    const fileInputRef = useRef(null);
    const attachmentInputRef = useRef(null);

    useEffect(() => {
        socket.on('progress', ({ progress, email, status }) => {
            setProgress(progress);
            setEmailStatus(prevStatus => [
                ...prevStatus,
                { to: email, success: status === "Success", error: status !== "Success" ? status : null }
            ]);
        });

        return () => {
            socket.off('progress');
        };
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setFileName(selectedFile ? selectedFile.name : '');
    };

    const handleAttachmentChange = (e) => {
        const selectedAttchFile = e.target.files[0];
        setAttachment(selectedAttchFile);
        setAttachmentName(selectedAttchFile ? selectedAttchFile.name : '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please choose an Excel file.');
        if (!email || !password || !attachment) return alert('Please provide your email, password, and attachment.');

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('excelFilePath', file);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('attachment', attachment);

            await axios.post('http://localhost:3001/api/send-emails', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

        } catch (error) {
            alert('Internal Server Error. Please try again later.');
        } finally {
            setLoading(false);
            resetForm();
        }
    };

    const resetForm = () => {
        setFile(null);
        setFileName('');
        setAttachment(null);
        setAttachmentName('');
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = null;
        if (attachmentInputRef.current) attachmentInputRef.current.value = null;
        // alert('All Emails Sent');
    };

    const clearStatus = () => {
        setEmailStatus([]);
    };

    const generateSampleExcel = () => {
        const emails = [
            { 'Email Address': 'example1@gmail.com', 'Subject': 'Meeting Reminder', 'Body': 'Dear User, we have a meeting tomorrow...' },
            { 'Email Address': 'example2@gmail.com', 'Subject': 'Special Offer', 'Body': 'Hello, check out our latest offers...' },
            { 'Email Address': 'example3@gmail.com', 'Subject': 'Important Update', 'Body': 'Important update regarding your account...' }
        ];

        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(emails);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Emails');
        xlsx.writeFile(workbook, 'sample_emails.xlsx');

        alert('Sample Excel file generated successfully!');
    };

    return (
        <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} style={{ padding: '2rem', borderRadius: '8px', backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 'bold', color: '#3f51b5' }}>
                            Email Sender
                        </Typography>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={generateSampleExcel}
                            style={{ marginBottom: '1rem', alignSelf: 'center' }}
                        >
                            Generate Sample Excel
                        </Button>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <TextField
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                fullWidth
                                margin="normal"
                            />
                            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                <input
                                    id="attachment-input"
                                    type="file"
                                    name="attachment"
                                    onChange={handleAttachmentChange}
                                    style={{ display: 'none' }}
                                    ref={attachmentInputRef}
                                    required
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component="span"
                                    style={{ marginTop: '1rem', width: '100%' }}
                                    onClick={() => document.getElementById('attachment-input').click()}
                                >
                                    { attachmentName || 'Choose Attachment'}
                                </Button>
                            </Box>
                            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                <input
                                    id="file-input"
                                    type="file"
                                    name="file"
                                    accept=".xlsx"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                    required
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component="span"
                                    style={{ marginTop: '1rem', width: '100%' }}
                                    onClick={() => document.getElementById('file-input').click()}
                                >
                                    { fileName || 'Choose Excel File'}
                                </Button>
                            </Box>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                style={{ marginTop: '1rem', width: '100%' }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Send Emails"}
                            </Button>
                            <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                                Progress: {progress}%
                            </div>
                        </form>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} style={{ padding: '2rem', borderRadius: '8px', backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 'bold', color: '#3f51b5' }}>
                            Email Status
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={clearStatus}
                            style={{ marginBottom: '1rem', alignSelf: 'center' }}
                        >
                            Clear Status
                        </Button>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ fontWeight: 'bold' }}>Email Address</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {emailStatus.map((status, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{status.to}</TableCell>
                                            <TableCell>{status.success ? 'Sent Successfully' : 'Error: ' + status.error}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default App;
