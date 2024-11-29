import React, { useEffect, useState, useRef } from 'react';
import { RxCross2 } from "react-icons/rx";
import './Tabel.css';
import axios from 'axios';

const Tabel = () => {
    const [pdata, setdata] = useState([]);
    const [edit, setedit] = useState(false);
    const [editid, seteditid] = useState(0);
    const [currentEmployee, setCurrentEmployee] = useState({});
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null); 

    async function getdata() {
        const res = await axios.get('http://localhost:3001/employee');
        setdata(res.data);
    }

    useEffect(() => {
        getdata();
    }, []);

    const showform = (id, employee) => {
        setedit(true);
        seteditid(id);
        setCurrentEmployee(employee);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; 
        }
        setFile(null); 
    };

    const delet = async (id) => {
        const url = `http://localhost:3001/employee/${id}`;
        await axios.delete(url);
        getdata();
    };

    const close = () => {
        setedit(false);
    };

    const formupdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', document.getElementById('uname').value);
        formData.append('age', document.getElementById('uage').value);
        formData.append('salary', document.getElementById('usal').value);
        
        if (fileInputRef.current.files.length > 0) {
            formData.append('file', file);
        }

        try {
            const updateurl = `http://localhost:3001/employee/${editid}`;
            await axios.put(updateurl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setedit(false);
            getdata();
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    };

    const add = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', document.getElementById('fname').value);
        formData.append('age', document.getElementById('fage').value);
        formData.append('salary', document.getElementById('fsal').value);
        if (file) {
            formData.append('file', file);
        }

        try {
            const result = await axios.post('http://localhost:3001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (result.status === 201) {
                console.log('Form added');
            } else {
                console.log('Form not added');
            }
            getdata();
            document.getElementById('fname').value = '';
            document.getElementById('fage').value = '';
            document.getElementById('fsal').value = '';
            setFile(null);
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    };

    const reset = (e) => {
        const currentFile=`http://localhost:3001/uploads/${tdata.file}`
        e.preventDefault();
        document.getElementById('uname').value = currentEmployee.name || '';
        document.getElementById('uage').value = currentEmployee.age || '';
        document.getElementById('usal').value = currentEmployee.salary || '';

        if (fileInputRef.current) {
            fileInputRef.current.value = currentFile
        }
        setFile(null); 
    };

    return (
        <div>
            <h1 id='title'>CRUD Operations</h1>
            {!edit ? (
                <form id="form" onSubmit={add}>
                    <div className="fname">
                        Enter Your Name:<input type="text" name='fname' id='fname' required />
                    </div>
                    <div className="fage">
                        Enter Your Age:<input type="number" name='fage' id='fage' required />
                    </div>
                    <div className="fsal">
                        Enter Your Salary:<input type='number' name='fsal' id='fsal' required />
                    </div>
                    <div className="file">
                        Upload File:<input type='file' onChange={(e) => setFile(e.target.files[0])} required id='ffile' />
                    </div>
                    <input type="submit" value="ADD" id='add' />
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
                                                    src={`http://localhost:3000/uploads/${tdata.file}`}
                                                    alt={tdata.name}
                                                    width='50px'
                                                    height='50px'
                                                />
                                            ) : (
                                                <p>No image</p>
                                            )}
                                        </td>
                                        <td><button onClick={() => showform(tdata._id, tdata)} id='edit'>Edit</button></td>
                                        <td><button onClick={() => delet(tdata._id)} id='del'>Delete</button></td>
                                    </tr>
                                ))
                            ) : <h1>No employee</h1>}
                        </tbody>
                    </table>
                ) : null}

                {edit && (
                    <>
                        <h1 className='text'>Edit Your Details</h1>
                        <form id='container' onSubmit={formupdate} onReset={reset}>
                            <RxCross2 onClick={close} id='icon' />
                            <label htmlFor="name">Enter your name:</label>
                            <input type="text" name="name" id="uname" defaultValue={currentEmployee.name || ''} />
                            <label htmlFor="age">Enter your age:</label>
                            <input type="number" name="age" id="uage" defaultValue={currentEmployee.age || ''} />
                            <label htmlFor="sal">Enter your salary:</label>
                            <input type="number" name="sal" id="usal" defaultValue={currentEmployee.salary || ''} />
                            <label htmlFor="ufile">Upload New File:</label>
                            <input type="file" name='file' id='ufile' ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} />
                            <p>Current file: {currentEmployee.file}</p>
                            <input type="reset" value="reset" id='reset' />
                            <input type="submit" value="update" id='update' />
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Tabel;
