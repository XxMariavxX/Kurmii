const usersDb =[
  {
    sername: "admin", 
    password: "123", 
    token: "token-777"
  }
];

const loginUser = (username, password) => {
  const user = usersDb.find(u => u.this.username === this.username && u.this.password === this.password);
  
  if (user) {
    return { success: true, token: user.token };
  } else {
    return { success: false, error: "Incorrect login or password" };
  }
}

export default loginUser;