import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import { contractABI, contractAddress } from '../utils/constants'

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract;
};


export const TransactionProvider = ({ children }) => {
    const [currentAccounts, setCurrentAccounts] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState({
        addressTo: '',
        amount: '',
        keyword: '',
        message: ''
    });

    
    


    const handleChange = (e, name) => {
        setFormData((prevState) => ({
            ...prevState, [name]: e.target.value
        }));
    }

    const getAllTransactions = async () => {
        try{
            if(!ethereum) return alert("Please Install Metamask!");
            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();
            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }));
            console.log(structuredTransactions);
            setTransactions(structuredTransactions);
        }catch(error)
        {
            console.error(error);
        }
    }

    const checkIfWalletIsConnected = async () => {
        try{
            if(!ethereum) return alert("Please Install Metamask!");
    
            const accounts = await ethereum.request({ method: 'eth_accounts' });
    
            // check if there is already a connected account
            if(accounts.length){
                setCurrentAccounts(accounts[0]);
    
                getAllTransactions();
            }else{
                console.log('No accounts found!');
            }

        }catch(error){
            console.error(error);
            throw new Error("No ethereum object.")
        }

    }


    const checkIfTransactionsExist = async () => {
        try{
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem("transactionCount", transactionCount);
        }catch(error)
        {
            console.error(error);
            throw new Error("No ethereum object.")
        }
    }

    const connectWallet = async () => {
        try{
            // check if metamask exists
            if(!ethereum) return alert("Please Install Metamask!");

            // request for metamask account
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            // Choose account
            setCurrentAccounts(accounts[0])
        }catch(error){
            console.error(error);

            throw new Error("No ethereum object.")
        }
    }


    const sendTransaction =async () => {
        try{
            if(!ethereum) return alert("Please Install Metamask!");
            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccounts,
                    to: addressTo,
                    gas: '0x5208',
                    value: parsedAmount._hex,
                }]
            });

           const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword); 
            setIsLoading(true);
            console.log(`Loading ~ ${transactionHash.hash}`);

            await transactionHash.wait();

            setIsLoading(false);
            console.log(`Success ~ ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());

            window.reload();

        }catch(error){
            console.error(error);
            throw new Error("No ethereum object.")
        }
    }


    

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []);
    return (
        <TransactionContext.Provider value={{connectWallet, currentAccounts, formData, setFormData, sendTransaction, handleChange, transactions, isLoading}}>
            {children}
        </TransactionContext.Provider>
    );
}