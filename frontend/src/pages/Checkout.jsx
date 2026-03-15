import api from "../api";

const handlePayment = async () => {

  const { data: order } = await api.post("/payment/create-order", {
    amount: 500
  });

  const options = {
    key: "rzp_test_xxxxx", // your Razorpay key
    amount: order.amount,
    currency: order.currency,
    order_id: order.id,

    name: "Pizza Delivery",
    description: "Pizza Order Payment",

    handler: function (response) {
      alert("Payment Successful!");
      console.log(response);
    },

    theme: {
      color: "#ff6b35"
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

export default function Checkout(){
  return <button onClick={handlePayment}>Pay Now</button>;
}