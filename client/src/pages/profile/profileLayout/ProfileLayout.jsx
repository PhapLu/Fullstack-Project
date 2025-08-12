// Imports
import React, { useEffect, useState } from "react";

import './ProfileLayout.css';
import { apiUtils } from "../../../utils/newRequest";
export default function ProfileLayout() {
    const [data, setData] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiUtils.get("/user/readData");
                setData(response.data.metadata);
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <>
            <h1>TAO LA ProfileLayout</h1>
            <p>DATA NE MAY {data}</p>
        </> 
    );
}