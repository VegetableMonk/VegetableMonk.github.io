const URL_COURSE = 'https://stud.mgri.ru/api/ElectronicEducation/Task?courseID='
const URL_MGRI = 'https://stud.mgri.ru/'
const URL_TASK = 'https://stud.mgri.ru/WebApp/#/electronicEducation/'
const URL_COURSES = 'https://stud.mgri.ru/api/ElectronicEducation/ListCourse'
const URL_AUTH = 'https://stud.mgri.ru/api/tokenauth'

	var HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0',
    'Accept': 'application/json',
    'Accept-Language': 'ru,en-US;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Client-Version': '10.2.2',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Referer': 'https://stud.mgri.ru/WebApp/',
    'TE': 'Trailers',
    'Pragma': 'no-cache',
	'credentials': 'include',
    'Cache-Control': 'no-cache',
    'Content-type' : 'application/json', 'Accept' : 'application/json'   
}

async function GetToken(){
	localStorage.setItem('login',document.getElementById("login").value)
	localStorage.setItem('password',document.getElementById('password').value)
	
	

var OPTIONS = {
  'method': 'POST',
  'headers': HEADERS,
  'body': JSON.stringify(DATA),
  'muteHttpExceptions': true
}

	const DATA = {
    'userName': localStorage.getItem('login'),
    'password': localStorage.getItem('password')
}

	console.log (OPTIONS.payload)
		var response = await fetch("https://stud.mgri.ru/api/tokenauth",OPTIONS);
		let js = await response.json()
		if (! js['data']["accessToken"]) {
			document.getElementById('idstatus').innerHTML = 'NOT OK'
		}
		else{
			document.getElementById('idstatus').innerHTML = 'OK'
			localStorage.setItem('Token',js['data']["accessToken"])
		}		
}


async function getTasks(){

var OPTIONS = {
  'method': 'POST',
  'headers': HEADERS,
  'muteHttpExceptions': true
}

  HEADERS['Authorization'] = 'Bearer ' + localStorage.getItem('Token')
  OPTIONS['method'] = 'GET'
  OPTIONS['headers'] = HEADERS
  OPTIONS['body'] = null
  
// Берем список курсов
  var response = await fetch('https://stud.mgri.ru/api/ElectronicEducation/ListCourse', OPTIONS)
  var text = await response.json()
  const COURSES = {}
  text['data']['listCourse'].forEach(function(i){
    if (i['discipline']) {
       COURSES[i['discipline']] = i['courseID']
  }
  })
  
// Проходим по всем курсам и собираем задания
  Tasks = []
  var today = new Date()
  for (i in COURSES){
    
    response = await fetch('https://stud.mgri.ru/api/ElectronicEducation/ListCourseStudents?courseID=' + COURSES[i], OPTIONS)
    var text = await response.json()
     // Собираем инфу с каждого задания
     text['data']['list'].forEach(function(j){
      var date = j['periodRealization']
      date = new Date(date.slice(0,10))
      // (Не)Чекаем, чтобы они не были просрочеными
      if (true) {
        var file = ''
        if (j['file']){
          file = 'https://stud.mgri.ru/' + j['file']
        }
        //Собираем задание
		if (j['markName'] == null) {j['markName'] = ''}
		else j['markName'] = '('+j['markName']+')'
		var stat = j['statusName'] + j['markName']
        Task = [i, j['nameTask'],file, URL_TASK + COURSES[i], date,stat, j['notation'],j['statusID']]
        // Закидываем его ко всем заданиям
        Tasks[Tasks.length]= Task
      }
    })
  }
localStorage.setItem('tasks',JSON.stringify(Tasks))
}
function openLink(a){
	window.open(a)
}

function drawTasks(){
if (!localStorage.getItem('tasks')) return false
var text = JSON.parse(localStorage.getItem('tasks'))
document.getElementById('letters').remove()
document.getElementById('tasks').remove()
let tasksdiv = document.createElement('div')
tasksdiv.id = 'tasks'
tasksdiv.className = 'tasks'
document.body.appendChild(tasksdiv)


if (document.getElementById('tasksort').value == '1'){
  text.sort(function(a,b){

    if (new Date(a[4]) < new Date(b[4])){
      return -1
    }
    else { return 1}
  })
}
  
  
  
  let classes = ['course','task1','links','deadline','stat','notes']
  let t = 0
  let nd = document.createElement('div')
  let names = ['Курс','Задание','Ссылки','Дедлайн','Статус','Примечания']
  nd.className = 'task'
  names.forEach(function(i){
		let ndd = document.createElement('div')
		ndd.innerHTML = i
		ndd.className = 'point ' + classes[t]
		nd.appendChild(ndd)
		t=t+1
	})
	document.getElementById('tasks').appendChild(nd)
	t = 0
text.forEach(function(j){
	if (!(((j[7] == 4) & (document.getElementById('tasktodo').checked)) || ((j[7] == 1) & (document.getElementById('tasklate').checked)) || ((j[7] == 2) & (document.getElementById('taskwait').checked)))) 
	{
	nd = document.createElement('div')
	nd.className = 'task'
	j[4] = j[4].substr(0,10)
	let date = j[4].substr(8,2) + '.' + j[4].substr(5,2) + '.' + j[4].substr(0,4)
	j[4] = date
	let but1 = document.createElement('button')
	but1.innerHTML = 'Перейти к курсу'
	but1.setAttribute('onClick',"openLink('" + j[3] + "')")
	but1.className = 'buttons'

	j = [j[0],j[1],'',j[4],j[5],j[6]]
	j.forEach(function(i){
		let ndd = document.createElement('div')
		ndd.innerHTML = i
		ndd.className = 'point ' +  classes[t]
	if (ndd.className == 'point links'){
			ndd.appendChild(but1)
	}
	nd.appendChild(ndd)
	t=t+1
	})
	t = 0
	document.getElementById('tasks').appendChild(nd)
	}
})
}