import './index.html';

ymaps.ready(init);

function init() {
  const map = new ymaps.Map('map', {
    center: [55.76, 37.64],
    zoom: 10,
  });

  const clusterer = new ymaps.Clusterer({
    groupByCoordinates: true,
    clusterDisableClickZoom: true,
    clusterOpenBalloonOnClick: false,
  });

  map.events.add('click', (e) => onClick(e.get('coords')));
  map.geoObjects.add(clusterer);

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

  document.body.addEventListener('click', onDocumentClick);

  async function onClick(coords) {
    const list = callApi('list', { coords });

    const form = await createForm(coords, list);
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

  async function createForm(coords, reviews) {
    const root = document.createElement('div');
    root.innerHTML = document.querySelector('#addFormTemplate').innerHTML;
    const reviewList = root.querySelector('.review-list');
    const reviewForm = root.querySelector('[data-role=review-form]');
    reviewForm.dataset.coords = JSON.stringify(coords);
    const address = root.querySelector('.address-line');
    const addressLine = await revGeoCoder(coords);

    console.log(addressLine);
    console.log(address);
    address.innerText = addressLine;

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

  async function revGeoCoder(coords) {
    const response = await ymaps.geocode(coords);
    return response.geoObjects.get(0).getAddressLine();
  }
}

function callApi(method, body = {}) {
  const storage = JSON.parse(localStorage.getItem('reviews')) || {};
  const index = JSON.stringify(body.coords);
  switch (method) {
    case 'coords':
      return Object.keys(storage).map((key) => {
        return {
          coords: JSON.parse(key),
          total: storage[key].length,
        };
      });
      break;
    case 'list':
      return storage[index] || [];
      break;
    case 'add':
      storage[index] = storage[index] || [];
      storage[index].push(body.review);
      localStorage.setItem('reviews', JSON.stringify(storage));
      break;
    default:
      return {};
  }
}
