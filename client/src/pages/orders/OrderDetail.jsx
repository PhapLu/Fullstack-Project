import { useParams } from "react-router-dom";
export default function OrderDetail(){ const {id}=useParams(); return <div>Order {id}</div>; }