import InteractiveMap from './interactive-map.js';

export default class GeoReview {
  constructor() {
    this.formTemplate = document.querySelector('#addFormTemplate').innerHTML;
    this.map = new InteractiveMap('map', this.onClick.bind(this));
    this.map.init().then(this.onInit.bind(this));
  }

  onInit() {
    const coords = this.callApi('coords');
    console.log(coords);

    for (const item of coords) {
      for (let i = 0; i < item.total; i++) {
        this.map.createPlacemark(item.coords);
      }
    }

    document.body.addEventListener('click', this.onDocumentClick.bind(this));
  }

  callApi(method, body = {}) {
    // const res = await fetch(`/maps/${method}`, {
    //   method: 'post',
    //   body: JSON.stringify(body),
    // });
    // return await res.json();
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

  createForm(coords, reviews) {
    const root = document.createElement('div');
    root.innerHTML = this.formTemplate;
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

  async onClick(coords) {
    this.map.openBalloon(coords, 'Загрузка...');
    const list = await this.callApi('list', { coords });
    const form = this.createForm(coords, list);
    this.map.setBalloonContent(form.innerHTML);
  }

  async onDocumentClick(e) {
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
        await this.callApi('add', data);
        this.map.createPlacemark(coords);
        this.map.closeBalloon();
      } catch (e) {
        const formError = document.querySelector('.form-error');
        formError.innerText = e.message;
      }
    }
  }
}
