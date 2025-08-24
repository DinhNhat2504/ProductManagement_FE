import { useState } from 'react'
import './App.css'
import MyComponent from './components/TestComponent/MyComponent.jsx'
import TabButton from './components/TestComponent/TabButton.jsx'
import { EXAMPLES } from './data';


function Test() {
const [selectedNew,setHandleTopic] = useState("Trời hôm nay : ");
const [newDate,setDate] = useState("Chào bạn !");
const [selectedData,seHandleData] = useState();

function handleSelect (selectedButton){
 setHandleTopic(selectedButton);
}
function handleDate (selectedDate){
  setDate(selectedDate);
}
function handleData(selectData){
  seHandleData(selectData);
}
const title = [
    "Nắng",
    "Mưa",
    "Mây"
]
;
let ranDomTitle = () => 
    Math.floor(Math.random() * title.length)

const isDate = () => {
  let date = new Date();
  let hour = date.getHours();
  if(hour>= 5 && hour <=12){
    return "Chào buổi sáng"
  }else if(hour>12 && hour <=18){
    return "Chào buổi chiều"
  }else return "Chào buổi tối"
}
  return (
    <>  
      <menu className="max-w-7xl flex flex-col text-center p-8 mx-auto bg-linear-to-bl from-violet-500 to-fuchsia-500 rounded-lg">
        <MyComponent />
        <TabButton onSelect={()=>{handleSelect(title[ranDomTitle()])}}>Cập nhật thời tiết</TabButton>
        <TabButton onSelect={()=>{handleDate(isDate)}}>Cập nhật lời chào</TabButton>
        <span className='text-center'>
        {selectedNew}
      </span>
      <span>
        {newDate}
      </span>
      </menu>
      <div>
          <TabButton onSelect={()=>{handleData("components")}}>Components</TabButton>
        <TabButton onSelect={()=>{handleData("jsx")}}>JSX</TabButton>
        <TabButton onSelect={()=>{handleData("props")}}>Props</TabButton> 
        <TabButton onSelect={()=>{handleData("state")}}>State</TabButton>
        </div>
      <div className='max-w-xl flex flex-col p-8 mx-auto bg-fuchsia-950 rounded-lg'>
        
        {!selectedData ? (
           <p>Vui lòng chọn 1 </p>
         ) : ( 
          <div className='text-[13px] text-white'>
          <h3>{EXAMPLES[selectedData].title}</h3>
        <p>{EXAMPLES[selectedData].desc}</p>
        <pre>
          <code>
              {EXAMPLES[selectedData].code}
          </code>
        </pre>
        </div>
         )}
        
        
      </div>
      
    </>
  )
}

export default Test