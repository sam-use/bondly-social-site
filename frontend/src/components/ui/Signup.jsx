import React from "react";

const Signup = () => {
  console.log("Signup component rendering"); // Debug log

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#fafafa'
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '350px',
        width: '100%'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Instagram</h1>
        <p style={{ textAlign: 'center', marginBottom: '30px' }}>Create your account</p>
        
        <form>
          <div style={{ marginBottom: '15px' }}>
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dbdbdb',
                borderRadius: '4px',
                marginTop: '5px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Email</label>
            <input 
              type="email" 
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dbdbdb',
                borderRadius: '4px',
                marginTop: '5px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter a strong password"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dbdbdb',
                borderRadius: '4px',
                marginTop: '5px'
              }}
            />
          </div>
          
          <button 
            type="submit"
            style={{
              width: '100%',
              background: '#0095f6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Sign Up
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Already have an account? <a href="/login" style={{ color: '#0095f6' }}>Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
