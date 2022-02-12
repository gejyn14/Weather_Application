if(process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path');
const fetch = require('node-fetch')
const {lookup} = require('geoip-lite')

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//Use view engine
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req,res) => {
    const ip = "182.221.44.254";
    const location = lookup(ip).city;
    const coordinates = lookup(ip).ll;
    await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${coordinates[0]}&lon=${coordinates[1]}&appid=${OPENWEATHER_API_KEY}&units=metric`)
            .then(res=>res.json())
            .then(data=>{
                const des = data.weather[0].description;
                const icon = data.weather[0].icon;
                const temp = data.main.temp;
                const humidity = data.main.humidity;
                res.render('home', {location, icon, des, temp, humidity})
            })
})

app.post('/', async (req,res) => {
    const location = req.body.location;
    const coordinates = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${OPENWEATHER_API_KEY}`)
        .then(res=>res.json()).then(data => {
            if (data.length === 0) return "City Not Found"
            const {lat, lon} = data[0];
            return [lat, lon]
        })
 
    await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${coordinates[0]}&lon=${coordinates[1]}&appid=${OPENWEATHER_API_KEY}&units=metric`)
            .then(res=>res.json())
            .then(data=>{
                const des = data.weather[0].description;
                const icon = data.weather[0].icon;
                const temp = data.main.temp;
                const humidity = data.main.humidity;
                res.render('home', {location, icon, des, temp, humidity})
            })
})

app.listen(3000, ()=> {
    console.log(`Port 3000 listening.....`)
})