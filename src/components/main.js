import * as React from "react";
import { useState, useEffect } from "react";
import { Contract, ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import busdAbi from "../helpers/busd.json";
import mainAbi from "../helpers/contact.json";
import { GetContract } from "../helpers/Contract";
import Account from "./account";

import busdLogo from "../assets/images/busd.png";
import logo from "../assets/images/logo.png";

import {
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    Typography,
    FormControl,
    OutlinedInput,
    InputAdornment,
    Stepper,
    Step,
    StepLabel,
    StepContent,
} from "@mui/material";

function Main(props) {
    const { library, account } = useWeb3React();
    const [presaleInfo, setPresaleInfo] = useState({
        hardcap: 0,
        presale_end: "",
        presale_start: "",
        raise_max: 0,
        raise_min: 0,
        token_rate: "",
    });
    const [presaleStatus, setPresaleStatus] = useState({ sold_amount: 0, raised_amount: 0, num_buyers: 0 });
    const [buyerInfo, setBuyerInfo] = useState({ base: 0, sale: 0 });
    const [presaleStep, setStep] = useState(0);
    const [vestingStep, setVestingStep] = useState(0);
    const [busd, setBusd] = useState(0);
    const presaleContract = GetContract("0x7e09f95016bc2f71d0e1cfe66835e4b25248e5c1", mainAbi);
    const busdContract = GetContract("0xC20B7806aE386ACe91b529076867E8eFd6a09D22", busdAbi);
    const convert = (val) => {
        return ethers.utils.formatUnits(val, 18).toString() * 1;
    };
    const convertDate = (val) => {
        let d = new Date(val);
        let dformat =
            [d.getUTCFullYear(), ("0" + (d.getUTCMonth() + 1)).slice(-2), ("0" + d.getUTCDate()).slice(-2)].join("-") +
            " " +
            [("0" + d.getUTCHours()).slice(-2), ("0" + d.getUTCMinutes()).slice(-2), ("0" + d.getUTCSeconds()).slice(-2)].join(":");
        return dformat;
    };
    const handleBuy = async () => {
        if (!account) {
            alert("connect wallet first");
            return;
        }
        let buffer = await busdContract.approve("0x7e09f95016bc2f71d0e1cfe66835e4b25248e5c1", (busd * Math.pow(10, 18)).toString());
        await buffer.wait();
        await presaleContract.userDeposit((busd * Math.pow(10, 18)).toString());
    };
    const handleWithdraw = () => {
        if (!account) {
            alert("connect wallet first");
            return;
        }
        presaleContract.userWithdrawTokens();
    };

    const setValues = async () => {
        await presaleContract.presale_info().then((val) => {
            console.log(val, "----------------------contractinfo");
            console.log(convert(val.token_rate));
            setPresaleInfo(val);
        });
        await presaleContract.status().then((val) => {
            console.log(val, "-----------------status");
            setPresaleStatus(val);
        });
        await presaleContract.buyers(account).then((val) => {
            console.log(val, "-----------------------buyerinfo");
            setBuyerInfo(val);
        });
        await presaleContract.PreSaleStatus().then((val) => {
            console.log(ethers.utils.formatUnits(val, 0).toString() * 1, "--------------------presale status");
            setStep(ethers.utils.formatUnits(val, 0).toString() * 1);
        });
    };
    useEffect(() => {
        if (account) {
            setValues();
        }
    }, [account]);

    return (
        <Box sx={{ maxWidth: "600px", m: "auto" }}>
            <Box sx={{ float: "right", mt: 2, mr: 3 }}>
                <Account />
            </Box>
            <Grid container spacing={0}>
                <Grid item xs={12}>
                    <Card sx={{ m: 3, backgroundColor: "#806643", color: "white", borderRadius: "20px" }} className="mCard">
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", mb: 3 }}>
                                <Box
                                    component="img"
                                    src={logo}
                                    sx={{ float: "left", borderRadius: "20px", width: { sm: "150px", xs: "100px" } }}
                                    alt="ETH"
                                />
                                <Typography sx={{ ml: 5, my: "auto", fontSize: { sm: "30px", xs: "20px" } }}>ALKEBULEUM (AKE) Pre-sale</Typography>
                            </Box>
                            <Box className="spaceBetween">
                                <Typography variant="h6" component="span">
                                    Token Rate:
                                </Typography>
                                <Typography variant="h6" component="span">
                                    {presaleInfo.token_rate === "" ? "" : 1 / ethers.utils.formatUnits(presaleInfo.token_rate, 0)} ETH
                                </Typography>
                            </Box>
                            <Box className="spaceBetween">
                                <Typography variant="h6" component="span">
                                    Softcap:
                                </Typography>
                                <Typography variant="h6" component="span">
                                    {convert(presaleInfo.hardcap)} ETH
                                </Typography>
                            </Box>
                            <Box className="spaceBetween">
                                <Typography variant="h6" component="span">
                                    Hardcap:
                                </Typography>
                                <Typography variant="h6" component="span">
                                    {convert(presaleInfo.hardcap)} ETH
                                </Typography>
                            </Box>
                            <Box className="spaceBetween">
                                <Typography variant="h6" component="span">
                                    Buy min:
                                </Typography>
                                <Typography variant="h6" component="span">
                                    {convert(presaleInfo.raise_min)} ETH
                                </Typography>
                            </Box>
                            <Box className="spaceBetween">
                                <Typography variant="h6" component="span">
                                    Buy max:
                                </Typography>
                                <Typography variant="h6" component="span">
                                    {convert(presaleInfo.raise_max)} ETH
                                </Typography>
                            </Box>
                            <Box className="spaceBetween">
                                <Typography variant="h6" component="span">
                                    Start
                                </Typography>
                                <Typography variant="h6" component="span">
                                    {convertDate(presaleInfo.presale_start * 1000)} (UTC)
                                </Typography>
                            </Box>
                            <Box className="spaceBetween">
                                <Typography variant="h6" component="span">
                                    End
                                </Typography>
                                <Typography variant="h6" component="span">
                                    {convertDate(presaleInfo.presale_end * 1000)} (UTC)
                                </Typography>
                            </Box>

                            <Typography variant="h5" gutterBottom component="div" sx={{ borderBottom: "solid 6px", pb: 1, mt: 2 }}>
                                Pre-sale Status
                            </Typography>
                            <Box className="spaceBetween">
                                <Typography variant="h6" component="span">
                                    Raised Amount
                                </Typography>
                                <Typography variant="h6" component="span">
                                    {convert(presaleStatus.raised_amount)} ETH
                                </Typography>
                            </Box>
                            <Box className="spaceBetween">
                                <Typography variant="h6" component="span">
                                    Sold Amount
                                </Typography>
                                <Typography variant="h6" component="span">
                                    {convert(presaleStatus.sold_amount)} AKE
                                </Typography>
                            </Box>

                            <Typography variant="h5" gutterBottom component="div" sx={{ borderBottom: "solid 6px", pb: 1, mt: 2 }}>
                                Buyer Information
                            </Typography>
                            <Box className="spaceBetween">
                                <Typography variant="h6" component="span">
                                    Invested
                                </Typography>
                                <Typography variant="h6" component="span">
                                    {convert(buyerInfo.base)} ETH
                                </Typography>
                            </Box>
                            <Box className="spaceBetween">
                                <Typography variant="h6" component="span">
                                    AKE Amount
                                </Typography>
                                <Typography variant="h6" component="span">
                                    {convert(buyerInfo.sale)} AKE
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    mt: 3,
                                    display: presaleStep === 1 ? "flex" : "none",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexFlow: "column",
                                }}
                            >
                                <FormControl>
                                    <OutlinedInput
                                        value={busd}
                                        sx={{
                                            backgroundColor: "white",
                                            "& .MuiOutlinedInput-notchedOutline legend": { display: "none" },
                                            "& .MuiOutlinedInput-notchedOutline": { display: "none" },
                                        }}
                                        onChange={(e) => {
                                            setBusd(e.target.value);
                                        }}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <Box sx={{ width: 20, float: "left" }} component="img" src={busdLogo} alt="ETH" />
                                                &nbsp;ETH
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                                <Button
                                    variant="contained"
                                    disableElevation
                                    onClick={handleBuy}
                                    sx={{ width: 100, mt: 2, backgroundColor: "#6a8b6c", "&:hover": { backgroundColor: "#04070c" } }}
                                >
                                    Buy
                                </Button>
                            </Box>
                            <Box sx={{ justifyContent: "center", mt: 3, display: presaleStep > 1 ? "flex" : "none" }}>
                                <Button
                                    variant="contained"
                                    disableElevation
                                    onClick={handleWithdraw}
                                    sx={{ mt: 2, backgroundColor: "#6a8b6c", "&:hover": { backgroundColor: "#04070c" } }}
                                >
                                    Withdraw
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Main;
