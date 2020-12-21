import './index.html';
// import GeoReview from './Georeview.js';


// new GeoReview();

ymaps.ready(init);

function init() {
    const map = new ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 10,
    });

    map.events.add('click', (e) => onClick(e.get('coords')));
    map.geoObjects.add(clusterer);

    const clusterer = new ymaps.Clusterer({
        groupByCoordinates: true,
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: false,
    });

    clusterer.events.add('click', (e) => {
        const coords = e.get('target').geometry.getCoordinates();
        onClick(coords);
    });

    const places = callApi('coords');

    for (const item of places) {
        for (let i = 0; i < item.total; i++) {
          createPlacemark(item.coords);
        }
    }
  
    document.body.addEventListener('click', onDocumentClick(element));

    function onClick(coords) {
        const list = callApi('list', { coords });
        const form = createForm(coords, list);
        const formContent = form.innerHTML;
        map.balloon.open(coords, formContent);
    }

    function createPlacemark(coords) {
        const placemark = new ymaps.Placemark(coords);
        placemark.events.add('click', (e) => {
          const coords = e.get('target').geometry.getCoordinates();
          onClick(coords);
        });
        clusterer.add(placemark);
    }

    function onDocumentClick(e) {
        if (e.target.dataset.role === 'review-add') {
          const reviewForm = document.querySelector('[data-role=review-form]');
          const coords = JSON.parse(reviewForm.dataset.coords);
          const data = {
            coords,
            review: {
              name: document.querySelector('[data-role=review-name]').value,
              place: document.querySelector('[data-role=review-place]').value,
              text: document.querySelector('[data-role=review-text]').value,
            },
          };
    
          try {
            callApi('add', data);
            createPlacemark(coords);
            map.balloon.close();
          } catch (e) {
            const formError = document.querySelector('.form-error');
            formError.innerText = e.message;
          }
        }
    }
}

// async function init() {
//     initMap('map');
// }

// function injectYMapsScript() {
//     return new Promise((resolve) => {
//       const ymapsScript = document.createElement('script');
//       ymapsScript.src =
//         'https://api-maps.yandex.ru/2.1/?apikey=5a4c2cfe-31f1-4007-af4e-11db22b6954b&lang=ru_RU';
//       document.body.appendChild(ymapsScript);
//       ymapsScript.addEventListener('load', resolve);
//     });
// }
 
// injectYMapsScript().then(function() {
//     ymaps.ready(init);
// }).then(function() {
//     initialPlaces();
// })

// function initialPlaces() {
//     const coords = callApi('coords');
//     console.log(coords);
  
//     for (const item of coords) {
//         for (let i = 0; i < item.total; i++) {
//           createPlacemark(item.coords);
//         }
//     }
  
//     document.body.addEventListener('click', onDocumentClick(element));
// }

// function onDocumentClick(e) {
//     if (e.target.dataset.role === 'review-add') {
//       const reviewForm = document.querySelector('[data-role=review-form]');
//       const coords = JSON.parse(reviewForm.dataset.coords);
//       const data = {
//         coords,
//         review: {
//           name: document.querySelector('[data-role=review-name]').value,
//           place: document.querySelector('[data-role=review-place]').value,
//           text: document.querySelector('[data-role=review-text]').value,
//         },
//       };

//       try {
//         callApi('add', data);
//         createPlacemark(coords);
//         map.balloon.close();
//       } catch (e) {
//         const formError = document.querySelector('.form-error');
//         formError.innerText = e.message;
//       }
//     }
// }

// function initMap(mapId) {
//     const clusterer = new ymaps.Clusterer({
//       groupByCoordinates: true,
//       clusterDisableClickZoom: true,
//       clusterOpenBalloonOnClick: false,
//     });
//     clusterer.events.add('click', (e) => {
//       const coords = e.get('target').geometry.getCoordinates();
//       onClick(coords);
//     });
//     const map = new ymaps.Map(mapId, {
//       center: [55.76, 37.64],
//       zoom: 10,
//     });
//     map.events.add('click', (e) => onClick(e.get('coords')));
//     map.geoObjects.add(clusterer);
// }

// function onClick(coords) {
//     // this.map.openBalloon(coords, 'Загрузка...');
//     // const list = await this.callApi('list', { coords });
//     // const form = this.createForm(coords, list);
//     // this.map.setBalloonContent(form.innerHTML);
//     const list = callApi('list', { coords });
//     const form = createForm(coords, list);
//     const formContent = form.innerHTML;
//     map.balloon.open(coords, formContent);
// }

function callApi(method, body = {}) {
    // const res = await fetch(`/maps/${method}`, {
    //   method: 'post',
    //   body: JSON.stringify(body),
    // });
    // return await res.json();
    const storage = JSON.parse(localStorage.getItem('reviews')) || {};
    var index = JSON.stringify(body.coords);
    switch(method) {
      case 'coords':
        return Object.keys(storage).map((key) => {
          return {
            coords: JSON.parse(key),
            total: storage[key].length            }
        })

        break;
      case 'list':
        return storage[index] || [];
        
        break;
      case 'add':
        
        storage[index] = storage[index] || [];
        storage[index].push(body.review);
        localStorage.setItem('reviews', JSON.stringify(storage))
        break;
      default: 
        return {};
    }

}


function createForm(coords, reviews) {
    const root = document.createElement('div');
    root.innerHTML = document.querySelector('#addFormTemplate').innerHTML;
    const reviewList = root.querySelector('.review-list');
    const reviewForm = root.querySelector('[data-role=review-form]');
    reviewForm.dataset.coords = JSON.stringify(coords);

    for (const item of reviews) {
      const div = document.createElement('div');
      div.classList.add('review-item');
      div.innerHTML = `
          <div>
              <b>${item.name}</b> [${item.place}]
          </div>
          <div>${item.text}</div>
      `;
      reviewList.appendChild(div);
    }

    return root;
}

// function createPlacemark(coords) {
//     const placemark = new ymaps.Placemark(coords);
//     placemark.events.add('click', (e) => {
//       const coords = e.get('target').geometry.getCoordinates();
//       onClick(coords);
//     });
//     clusterer.add(placemark);
// }