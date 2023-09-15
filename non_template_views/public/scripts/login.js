const username = document.getElementById("form__username")
const password = document.getElementById("form__pass")
const reg_btn = document.querySelector('.myform-btn-register')

const submit = document.querySelector('.myform-btn')
submit.addEventListener('click', processLoginForm.bind())
reg_btn.addEventListener('click', goToRegister.bind())

function processLoginForm(e){
	if(!(username.value && password.value)){
		return
	}
	console.log(username.value, password.value)
	console.log(e)

	const data = { email: username.value, password: password.value };

	fetch('http://localhost:5500/api/auth/login/', {
		method: 'POST', 
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
		})
		.then(response => response.json())
		.then(data => {
			console.log('Success:', data);
			doSomething(data)
		})
		.catch((error) => {
			console.error('Error:', error);
	});
	e.preventDefault()
	
}

function doSomething(data){
  if(!data.success){
    alert(data.msg)
    return
  }
	const token = data.token
	console.log(token)
	
	window.location.href="/home/";    
}

function goToRegister(e){
  console.log(e)
  window.location.href = '/register'
}