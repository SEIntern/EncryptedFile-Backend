export const userCredentialsEmail = (username, email, password,role) => `
  <div style="font-family: Arial, sans-serif;">
    <h2>Welcome, ${username} 👋</h2>
    <p>Your account has been created by your \`${role}\`. Here are your login credentials:</p>
    <ul>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>
    <p>👉 For security, please change your password after first login.</p>
    <a href="http://localhost:3000/login" 
       style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
       Login Now
    </a>
  </div>
`;
