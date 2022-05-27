import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import abi from "../abis/Covid19.json";


import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler';
import { Scheduler, WeekView, Appointments, AppointmentForm } from '@devexpress/dx-react-scheduler-material-ui';

import { Box, Button, Slider } from '@material-ui/core';
import Dialog from '@mui/material/Dialog';
import CircularProgress from '@mui/material/CircularProgress';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const contractAddress = "0x38fea4dd45a696c8708881AD8dBCc78b4B419dCC";
const contractABI = abi.abi;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const contract = new ethers.Contract(contractAddress, contractABI, provider.getSigner());
let currentBalance;
const Calendar = (props) => {

    // state for admin and usdPrice
    const [isAdmin, setIsAdmin] = useState(false);
    const [price, setPrice] = useState(false);
    const [rate, setRate] = useState(false);
    const [appointments, setAppointments] = useState([]);
    

    const [showDialog, setShowDialog] = useState(false);
    const [showSign, setShowSign] = useState(false);
    const [mined, setMined] = useState(false);
    const [transactionHash, setTransactionHash] = useState("");
    


    const getData = async () => {
        const owner = await contract.owner();          
        console.log(owner.toUpperCase());

    
        currentBalance = await contract.getBalance();
        currentBalance = (ethers.utils.formatEther(currentBalance.toString()));

        setIsAdmin(owner.toUpperCase() === props.account.toUpperCase());

        console.log(props.account.toUpperCase());

               
        const price = await contract.usdPrice();

        console.log(price.toString());
        setPrice(ethers.utils.formatEther(price.toString()));
        console.log("past usd")
        const appointmentData = await contract.getAppointments();

        console.log("heelloo");
        console.log('appointments shesh shesh shesh',typeof appointmentData, appointmentData);

        transformAppointmentData(appointmentData);
        
    }

    const transformAppointmentData = (appointmentData) => {
        let data = [];
        console.log(appointmentData);
        appointmentData.forEach(appointment => {
          data.push({
            title: appointment[1],
            startDate: new Date(appointment[2] * 1000),
            endDate: new Date(appointment.endTime * 1000),
          });
        });
        
    
        setAppointments(data);
    }

    useEffect(() => {
        getData();
    }, []);

    const saveAppointment = async (data) => {
        console.log('appointment saved');
        console.log(data); 

        const appointment = data.added;
        
        const startTime = appointment.startDate.getTime() / 1000;
        const endTime = appointment.endDate.getTime() / 1000;
        const title = appointment.title;
        console.log("title", title);
      
        setShowSign(true);
        setShowDialog(true);
        setMined(false);

        try {
            let cost = await contract.getEthTestFee();
            const msg = {value: cost.toString()};
            let transaction = await contract.createAppointment(title, startTime, endTime, msg);
            
            setShowSign(false);
            
            await transaction.wait();

            setMined(true);
            setTransactionHash(transaction.hash);
        } catch (error) {
            console.log(error);
        }
    }
    
    const saveRate = async () => {
        console.log('saving usdPrice of ', rate);
        
        const tx = await contract.changeUsdPrice(rate);

    }

    const handleSliderChange = (event, newValue) => {
        console.log('slider changed to', newValue);
        setRate(newValue);
    };

    const marks = [
    {
        value: 0,
        label: 'Free',
    },
    {
        value: 25,
        label: '$25/test',
    },
    {
        value: 50,
        label: '$50/test',
    },
    {
        value: 75,
        label: '$75/test',
    },
    {
        value: 100,
        label: '$100/test',
    },
    {
        value: 125,
        label: '$125/test',
    },
    {
        value: 150,
        label: '$150/test',
    },
    {
        value: 175,
        label: '$175/test',
    },
    {
        value: 200,
       label: '$200/test',
    },
    ];

    const withdraw = async () => {
                
        const tx = await contract.withdraw();

    }
    
    const Pricing = () => {
        return <div id="pricing">
            <h3>Pricing: ${price}0/test </h3>
            <h4>Note: The equivalent amount of ETH will display on your metamask upon saving your appointment.</h4> 
        </div>
    }

    const Admin =  () => {

        return <div id="admin">
            <Box>
                <h2>Set Your USD Price</h2>
                <Slider defaultValue={parseFloat(rate)} 
                    step={25} 
                    min={0} 
                    max={200}
                    marks={marks}
                    valueLabelDisplay="auto"
                    onChangeCommitted={handleSliderChange} />
                <br /><br />
                <Button id={"settings-button"} onClick={saveRate} variant="contained">
                    <SettingsSuggestIcon /> save configuration</Button>
            </Box>
            <div><Button id={"withdraw-button"} onClick={withdraw} variant="contained">
                    Withdraw Balance</Button></div>
            <div>Current Balance: {currentBalance} ETH</div>
            
        </div>
    }
console.table('appointment a',appointments)
    const ConfirmDialog = () => {
        
        return <Dialog open={true}>
            <h3>
              {mined && 'Appointment Confirmed'}
              {!mined && !showSign && 'Confirming Your Appointment...'}
              {!mined && showSign && 'Please Sign to Confirm'}
            </h3>
            <div style={{textAlign: 'left', padding: '0px 20px 20px 20px'}}>
                {mined && <div>
                  Your appointment has been confirmed and is on the blockchain.<br /><br />
                  <a target="_blank" href={`https://rinkeby.etherscan.io/tx/${transactionHash}`}>View on Etherscan</a>
                  </div>}
              {!mined && !showSign && <div><p>Please wait while we confirm your appointment on the blockchain....</p></div>}
              {!mined && showSign && <div><p>Please sign the transaction to confirm your appointment.</p></div>}
            </div>
            <div style={{textAlign: 'center', paddingBottom: '30px'}}>
            {!mined && <CircularProgress />}
            </div>
            {mined && 
            <Button onClick={() => {
                setShowDialog(false);
                getData();
              }
              }>Close</Button>}
          </Dialog>
        }
        const schedulerData = [
            { startDate: '2022-05-23T05:45', endDate: '2022-05-23T11:00', title: 'Dogecoin Integration' },
           
          ];
          console.log('apple', appointments)
    return <div>
        {<Pricing/>}
        {isAdmin && <Admin/>}
        
        <div id="calendar">
        
            <Scheduler data={appointments}>
                <ViewState />
                <EditingState onCommitChanges={saveAppointment} />
                <IntegratedEditing />
                <WeekView startDayHour={9} endDayHour={19}/>
                <Appointments />
                <AppointmentForm />
        </Scheduler>
        </div>

        {showDialog && <ConfirmDialog />}
    </div>;

}

export default Calendar;