import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Container, Typography } from '@mui/material';
import axios from 'axios';
import socketIoClient from 'socket.io-client';

const socket = socketIoClient('http://localhost:3002');

function App() {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '2rem',
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        marginTop: '1rem',
    };

    const chooseFileButtonStyle = {
        marginTop: '1rem',
    };

    const sendEmailsButtonStyle = {
        marginTop: '1rem',
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setFileName(selectedFile ? selectedFile.name : '');
    };

    useEffect(() => {
        if (socket) {
            socket.on('progress', (progress) => {
                setProgress(progress);
                console.log("event captured", progress);
            });

            socket.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error);
            });

            socket.on('disconnect', (reason) => {
                console.log('WebSocket disconnected:', reason);
            });

            return () => {
                socket.disconnect();
            };
        } else {
            console.error('Socket instance is undefined or null.');
        }
    }, [socket]);



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert('Please choose an Excel file.');
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('excelFilePath', file);

            const response = await axios.post('http://localhost:3001/api/send-emails', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            console.log(response.data);

            // if (response.data.message === 'Bulk emails sent successfully.') {
                alert('Emails sent successfully.');
            // } else {
            //     alert('Error sending emails. Please try again.');
            // }
        } catch (error) {
            console.error('Error:', error);
            alert('Internal Server Error. Please try again later.');
        } finally {
            setLoading(false);
            // Reset the file and fileName state after submission
            setFile(null);
            setFileName('');
            setProgress(0);
        }
    };

    return (
        <Container maxWidth="sm" style={containerStyle}>
            <Typography variant="h4" align="center" gutterBottom>
                Email Sender
            </Typography>
            <form onSubmit={handleSubmit} style={formStyle}>
                <label htmlFor="file-input" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input
                        id="file-input"
                        type="file"
                        name="file"
                        accept=".xlsx"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        required
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        component="span"
                        style={chooseFileButtonStyle}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            fileName ? `Selected File: ${fileName}` : 'Choose Excel file'
                        )}
                    </Button>
                </label>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    style={sendEmailsButtonStyle}
                    disabled={loading}
                >
                    Send Emails
                </Button>
                <div style={{ marginTop: '1rem' }}>
                    Progress: {progress}%
                </div>
            </form>
        </Container>
    );
}

export default App;
