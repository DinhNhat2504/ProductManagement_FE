export default function TabButton ({children,onSelect}){
    return (
        <>
        <button className="border-2 rounded-lg bg-white mt-2 p-2 active:bg-amber-300" onClick={onSelect}>{children}</button>
        </>
    )
}