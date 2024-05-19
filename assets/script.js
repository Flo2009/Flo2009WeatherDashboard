const searchFormEl=document.querySelector('#search-form');
const cityNameInputEl=document.querySelector('#city-name-input');
const currentWeatherEl=document.querySelector('#current');
const currentWeatherDisplayEl=document.querySelector('#current-card');
const cityContainerEl=document.querySelector('#city-links');
const weatherDayOneEl=document.querySelector('#dayone-card');
const weatherDayTwoEl=document.querySelector('#daytwo-card');
const weatherDayThreeEl=document.querySelector('#daythree-card');
const weatherDayFourEl=document.querySelector('#dayfour-card');
const weatherDayFiveEl=document.querySelector('#dayfive-card');
const cityLinkEl=document.querySelector('#city-links')
const apiKey='0d552094f106990cbff9be54fa9c4761'

const formSubmissonHandler = function (event){
    event.preventDefault();
    
    const cityName=cityNameInputEl.value.trim();

    if (cityName){
        
        currentWeatherDisplayEl.textContent = '';
        weatherDayOneEl.textContent = '';
        weatherDayTwoEl.textContent = '';
        weatherDayThreeEl.textContent = '';
        weatherDayFourEl.textContent = '';
        weatherDayFiveEl.textContent = '';
        getLocationData(cityName, apiKey);
        cityAddToStorage(cityName);

    }else{
        alert('Please Enter a City Name');
    }
}

const cityAddToStorage = function(cityName){
    let check=false;
    let index=0;
    let cityArray = JSON.parse(localStorage.getItem('cities'));
    
    if (!cityArray){
        // console.log("Hello");
        cityArray=[];
        cityArray.push(cityName);
        localStorage.setItem(`cities`, JSON.stringify(cityArray));
    }else{
        for (let i=0; i<cityArray.length; i++){
            if (cityName==cityArray[i]){
                check=true;
            }
            index=i;
            
        }
        if (check){
            check=false;
            addCityLinks();
            return;
        }else{
            if (index>=10){
            //    console.log("Hello2");
               localStorage.removeItem('cities');
               cityArray=[];
               cityArray.push(cityName);
               localStorage.setItem('cities',JSON.stringify(cityArray)); 
               addCityLinks();
            }else{
                // console.log("Hello3");
                cityArray.push(cityName);
                localStorage.setItem('cities',JSON.stringify(cityArray)); 
                addCityLinks();
            }
            
        }
    }
}

const addCityLinks = function(){
    let cityArray = JSON.parse(localStorage.getItem('cities'));
    const cityLinks = $('#city-links');
    cityLinks.empty();

    for (city of cityArray){
        //create city link button on the card
        const cityLinkButton=$('<button>')
        .addClass('btn text-black border-dark')
        .text(city)
        .attr('city', city);
        cityLinkButton.on('click',getLinkCityData);

        cityLinks.append(cityLinkButton);

    }
}

const getLinkCityData = function(){
    currentWeatherDisplayEl.textContent = '';
    weatherDayOneEl.textContent = '';
    weatherDayTwoEl.textContent = '';
    weatherDayThreeEl.textContent = '';
    weatherDayFourEl.textContent = '';
    weatherDayFiveEl.textContent = '';
    getLocationData($(this).attr('city'), apiKey);

}

const getLocationData = function (cityName, apiKey){
   if (typeof cityName==='undefined'){
    return;
   }
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`
    
    
    fetch(apiUrl)
    .then(function(response){
        if (response.ok){
            response.json().then(function (data){
                // console.log(data);
                getWeatherData(data, apiKey, cityName);
            });
        }else {
            alert(`Error:${response.statusText}`);
        }
    })
    .catch(function (error){
        alert('Unable to connect to OpenWeather');
    });
}

const getWeatherData = function (location, apiKey, cityName){
    if (location.length===0){
        alert(`No location data present!`);
        return;
    }
    const lat=location[0].lat;
    const lon=location[0].lon;
    // console.log(apiKey);
    const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=hourly,minutely,alerts&appid=${apiKey}`
    
    if (lat && lon){
        fetch(apiUrl)
        .then(function(response){
            if (response.ok){
                response.json().then(function (data){
                    displayWeatherData(data, cityName);
                });
            } else{
                alert(`Error:${response.statusText}`);
            }
        })
        .catch(function (error){
            alert('Unable to retrieve Data');
        })
    }
    
}

const displayWeatherData = function(weatherData, cityName){
    if (weatherData.length===0){
        alert('No Weather Data Present');
        return;
    }
    
    localStorage.setItem(`weather`, JSON.stringify(weatherData));
    
    let currentDisplay = $('#current-card');
    let dateItem = dateConversion(weatherData.current.dt);
    let humidityItem = weatherData.current.humidity + '%';
    let tempItem = weatherData.current.temp + 'F';
    let windItem = weatherData.current.wind_speed + 'mph';
    let status = '#current-card';
    let cardContent={cityName, dateItem,tempItem,windItem,humidityItem, status};
    currentDisplay.append(createCard(cardContent));

    let weatherArray = weatherData.daily
    let statusArray = ['#dayone-card', '#daytwo-card', '#daythree-card', '#dayfour-card', '#dayfive-card'];
    // console.log(weatherArray);

    for (let i = 0; i < statusArray.length; i++){
        dateItem=dateConversion(weatherArray[i+1].dt);
        humidityItem=weatherArray[i+1].humidity + '%';
        tempItem=weatherArray[i+1].temp.day + 'F';
        windItem=weatherArray[i+1].wind_speed + 'mph';
        status=statusArray[i];
        currentDisplay=$(statusArray[i]);
        cardContent={cityName, dateItem,tempItem,windItem,humidityItem, status};

        currentDisplay.append(createCard(cardContent));
    }
    
};

const dateConversion = function(dte){
    let dtePresented = new Date(dte * 1000);
    let dd = dtePresented.getDate();
    let mm = dtePresented.getMonth();
    let yyyy= dtePresented.getFullYear();

    if (dd < 10){
        dd= '0' + dd;
    }else if (mm < 10){
        mm = '0' + mm;
    };
    dtePresented = `${mm}/${dd}/${yyyy}`;
    
    return dtePresented;
}

function createCard(cardContent) {
    //pass all the weather attributes to the card
      const newCard=$('<div>')
      .addClass('new-weather-card my-3')
    
      const cardHeader=$('<div>').addClass('weather-header h4').text(`${cardContent.cityName} ${cardContent.dateItem}`);
      const cardBody=$('<div>').addClass('weather-body');
      const cardTemp=$('<p>').addClass('weather-text').text(`Temperature: ${cardContent.tempItem}`);
      const cardWind=$('<p>').addClass('weather-text').text(`Wind: ${cardContent.windItem}`);
      const cardHumidity=$('<p>').addClass('weather-text').text(`Humidity: ${cardContent.humidityItem}`);
  
    if (cardContent.status === '#current-card') {
        newCard.addClass('text-black');
    } else{
        newCard.addClass('bg-dark text-white');
    
    };
    
  //append everything to the weather card
    cardBody.append(cardTemp, cardWind, cardHumidity);
    newCard.append(cardHeader, cardBody);
  
    return newCard;
  }
searchFormEl.addEventListener('submit', formSubmissonHandler);
cityLinkEl.addEventListener('click',getLinkCityData);
 