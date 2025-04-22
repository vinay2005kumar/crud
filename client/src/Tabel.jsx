import React, { useEffect, useState, useRef } from 'react';
import './Tabel.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Tabel = () => {
    const [pdata, setdata] = useState([]);
    const [edit, setedit] = useState(false);
    const [editid, seteditid] = useState(0);
    const [currentEmployee, setCurrentEmployee] = useState({});
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionType, setActionType] = useState(''); // Track which operation is in progress
    const fileInputRef = useRef(null);

    // Notify the user
    const notify = (message, type) => {
        if (type === 'success') {
            toast.success(message);
        } else if (type === 'error') {
            toast.error(message);
        } else if (type === 'warn') {
            toast.warn(message);
        } else if (type === 'info') {
            toast.info(message);
        }
    };

    // Fetch data from the backend
    const getdata = async () => {
        try {
            const res = await axios.get('http://localhost:3001/employee');
            setdata(res.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            notify('Failed to fetch employee data', 'error');
        }
    };

    useEffect(() => {
        getdata();
    }, []);

    // Show form for editing
    const showform = (id, employee) => {
        setedit(true);
        seteditid(id);
        setCurrentEmployee(employee);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setFile(null);
    };

    // Delete employee
    const delet = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            setLoading(true);
            setActionType('delete');
            try {
                await axios.delete(`http://localhost:3001/employee/${id}`);
                getdata();
                notify('Employee deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting employee:', error);
                notify('Failed to delete employee', 'error');
            } finally {
                setLoading(false);
                setActionType('');
            }
        }
    };

    // Close the edit form
    const close = () => {
        setedit(false);
    };

    // Update employee
    const formupdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setActionType('update');
        const formData = new FormData();
        formData.append('name', document.getElementById('uname').value);
        formData.append('age', document.getElementById('uage').value);
        formData.append('salary', document.getElementById('usal').value);

        if (fileInputRef.current.files.length > 0) {
            formData.append('file', file);
        }

        try {
            await axios.put(`http://localhost:3001/employee/${editid}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setedit(false);
            getdata();
            notify('Employee updated successfully', 'success');
        } catch (error) {
            console.error('Error updating employee:', error);
            notify('Failed to update employee', 'error');
        } finally {
            setLoading(false);
            setActionType('');
        }
    };

    // Add new employee
    const add = async (e) => {
        e.preventDefault();
        setLoading(true);
        setActionType('add');

        const formData = new FormData();
        formData.append('name', document.getElementById('fname').value);
        formData.append('age', document.getElementById('fage').value);
        formData.append('salary', document.getElementById('fsal').value);
        if (file) {
            formData.append('file', file);
        }

        try {
            const result = await axios.post('http://localhost:3001/upload', formData);
            if (result.status === 201) {
                getdata();
                notify('Employee added successfully', 'success');
                // Clear form after successful addition
                document.getElementById('fname').value = '';
                document.getElementById('fage').value = '';
                document.getElementById('fsal').value = '';
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setFile(null);
            } else {
                notify('Failed to add employee', 'error');
            }
        } catch (error) {
            console.error('Error adding employee:', error);
            notify('Failed to add employee', 'error');
        } finally {
            setLoading(false);
            setActionType('');
        }
    };

    // Reset the form fields
    const reset = (e) => {
        e.preventDefault();
        document.getElementById('uname').value = currentEmployee.name || '';
        document.getElementById('uage').value = currentEmployee.age || '';
        document.getElementById('usal').value = currentEmployee.salary || '';

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setFile(null);
        notify('Form reset to original values', 'info');
    };

    // Get button text based on loading state and action type
    const getButtonText = (action, defaultText) => {
        if (loading && actionType === action) {
            switch (action) {
                case 'add': return 'Adding...';
                case 'update': return 'Updating...';
                case 'delete': return 'Deleting...';
                default: return 'Processing...';
            }
        }
        return defaultText;
    };

    return (
        <div>
            <h1 id='title'>CRUD Operations</h1>
            {!edit ? (
                <form id="form" onSubmit={add}>
                    <div className="fname">
                        Enter Your Name: <input type="text" name='fname' id='fname' required />
                    </div>
                    <div className="fage">
                        Enter Your Age: <input type="number" name='fage' id='fage' required />
                    </div>
                    <div className="fsal">
                        Enter Your Salary: <input type='number' name='fsal' id='fsal' required />
                    </div>
                    <div className="file">
                        Upload File: <input 
                            type='file' 
                            onChange={(e) => setFile(e.target.files[0])} 
                            required 
                            id='ffile'
                            ref={fileInputRef}
                        />
                    </div>
                    <input 
                        type="submit" 
                        value={getButtonText('add', 'ADD')} 
                        id='add' 
                        disabled={loading} 
                        className={loading && actionType === 'add' ? 'loading-btn' : ''}
                    />
                </form>
            ) : null}

            <div className="tabel">
                {!edit ? (
                    <table border='1px' width='800px' id='table'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Age</th>
                                <th>Salary</th>
                                <th>Profile</th>
                                <th colSpan="2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pdata.length > 0 ? (
                                pdata.map((tdata, index) => (
                                    <tr key={index}>
                                        <td>{tdata.name}</td>
                                        <td>{tdata.age}</td>
                                        <td>{tdata.salary}</td>
                                        <td>
                                            {tdata.file ? (
                                                <img
                                                    src={tdata.file}
                                                    alt={tdata.name}
                                                    width='50px'
                                                    height='50px'
                                                />
                                            ) : (
                                                <p>No image</p>
                                            )}
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => showform(tdata._id, tdata)} 
                                                id='edit'
                                                disabled={loading}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => delet(tdata._id)} 
                                                id='del'
                                                disabled={loading}
                                                className={loading && actionType === 'delete' ? 'loading-btn' : ''}
                                            >
                                                {getButtonText('delete', 'Delete')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center' }}>No employees found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : null}

                {edit && (
                    <>
                        <div className="edit-overlay"></div>
                        <div className="edit-container">
                            <h1 className='text'>Edit Your Details</h1>
                            <form id='container' onSubmit={formupdate} onReset={reset}>
                                <button type="button" onClick={close} id='icon'>Close</button>
                                <label htmlFor="name">Enter your name:</label>
                                <input type="text" name="name" id="uname" defaultValue={currentEmployee.name || ''} required />
                                <label htmlFor="age">Enter your age:</label>
                                <input type="number" name="age" id="uage" defaultValue={currentEmployee.age || ''} required />
                                <label htmlFor="sal">Enter your salary:</label>
                                <input type="number" name="sal" id="usal" defaultValue={currentEmployee.salary || ''} required />
                                <label htmlFor="ufile">Upload New File:</label>
                                <input 
                                    type="file" 
                                    name='file' 
                                    id='ufile' 
                                    ref={fileInputRef} 
                                    onChange={(e) => setFile(e.target.files[0])} 
                                />
                                {currentEmployee.file && (
                                    <div className="current-image">
                                        <p>Current image:</p>
                                        <img 
                                            src={currentEmployee.file} 
                                            alt="Current employee" 
                                            width="100" 
                                            height="100" 
                                        />
                                    </div>
                                )}
                                <div className="form-buttons">
                                    <input 
                                        type="reset" 
                                        value="Reset" 
                                        id='reset' 
                                        disabled={loading} 
                                    />
                                    <input 
                                        type="submit" 
                                        value={getButtonText('update', 'Update')} 
                                        id='update' 
                                        disabled={loading} 
                                        className={loading && actionType === 'update' ? 'loading-btn' : ''}
                                    />
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
            {/* ToastContainer for showing the toast notifications */}
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default Tabel;