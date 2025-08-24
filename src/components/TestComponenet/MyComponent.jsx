import React from "react";

let today = new Date().toLocaleDateString();
let time = new Date().toLocaleTimeString();

const title = [
    "Hế lồooo",
    "Giờ sao",
    "Thế nào"
]

let ranDomTitle = () => 
    Math.floor(Math.random() * title.length)

function MyComponent() {
    
        return (
            < >
            <h1>{title[ranDomTitle()]}</h1>
            <p>Hôm nay là <strong>{today}</strong> thời gian <strong>{time}</strong></p>
            </>
            
        );
    
}


export default MyComponent;