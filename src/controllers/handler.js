document.getElementById('subscribe-button').addEventListener('click', async function(e) {
    e.preventDefault();

    // IMPORTANT: Replace with your public Razorpay Key ID from your dashboard
    const RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID'; 
    
    const planSelect = document.getElementById('plan-select');
    const plan_id = planSelect.value;

    if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'YOUR_RAZORPAY_KEY_ID') {
        alert('Please replace "YOUR_RAZORPAY_KEY_ID" in public/js/handler.js with your actual Razorpay Key ID.');
        return;
    }

    if (!plan_id || plan_id === 'YOUR_PLAN_ID_HERE') {
        alert('Please select a valid plan and replace the placeholder Plan ID in public/index.html');
        return;
    }

    try {
        // 1. Call your backend to create the subscription order
        // Note: Assumes you are running the frontend and backend on the same origin.
        const response = await fetch('/api/plan/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Your ProtectRoute middleware uses cookies, so the browser will send the AuthToken automatically.
            },
            body: JSON.stringify({ plan_id: plan_id })
        });

        const responseData = await response.json();

        if (!responseData.success || !responseData.data.order) {
            alert('Failed to create order: ' + responseData.message);
            return;
        }

        const order = responseData.data.order;

        // 2. Configure Razorpay checkout options
        const options = {
            key: RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: "Your Company Name",
            description: "Plan Subscription",
            order_id: order.id,
            
            // 3. This handler function is called by Razorpay after a successful payment
            handler: async function (paymentResponse) {
                try {
                    // Send the payment details to your backend for verification
                    const verificationResponse = await fetch('/api/plan/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature
                        })
                    });

                    const verificationData = await verificationResponse.json();

                    if (verificationData.success) {
                        alert('Payment successful and verified! Your subscription is now active.');
                        window.location.href = '/'; // Redirect to home or a success page
                    } else {
                        alert('Payment verification failed: ' + (verificationData.message || 'Unknown error'));
                    }
                } catch (error) {
                    console.error("Verification error:", error);
                    alert("Could not verify payment. Please contact support.");
                }
            },
            prefill: {
                // You can pre-fill customer details if they are logged in
                // name: "John Doe",
                // email: "john.doe@example.com",
            },
            theme: {
                color: "#3399cc"
            }
        };

        // 4. Create a new Razorpay instance and open the checkout modal
        const rzp = new Razorpay(options);

        rzp.on('payment.failed', function (response){
            alert('Payment failed: ' + response.error.description);
        });

        rzp.open();

    } catch (error) {
        console.error("An error occurred:", error);
        alert("Could not initiate payment. Please try again.");
    }
});