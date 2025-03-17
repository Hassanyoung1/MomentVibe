export default function Login() {
    return (
      <div className="login-container">
        <img src="logo.png" alt="Company Logo" width="150" />

        
         <h1>Welcome Back</h1>
         <p>Welcome Back, Please enter your details</p>
    
  
        <form>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" placeholder="Enter your name" />
  
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" />
  
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }
  