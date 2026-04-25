
async function testPinjamanApprove() {
    try {
        console.log("Testing API endpoint...");
        const res = await fetch('http://localhost:5000/api/admin/pinjaman/7/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'disetujui' })
        });
        
        console.log("Status:", res.status);
        const data = await res.json().catch(() => ({}));
        console.log("Data:", data);
    } catch (err) {
        console.error("Test failed:", err.message);
    }
}

testPinjamanApprove();
