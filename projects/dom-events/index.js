/* Задание со звездочкой */

/*
 Создайте страницу с кнопкой.
 При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией на экране
 Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
import './dnd.html';

const homeworkContainer = document.querySelector('#app');

document.addEventListener('mousemove', (e) => {});

export function createDiv() {
  const newDiv = document.createElement('div');
  const color = '#' + Math.round(0xffffff * Math.random()).toString(16);
  const divsize = Math.floor(Math.random() * 100).toFixed() + 'px';
  const posx = Math.floor(Math.random() * 100).toFixed() + 'px';
  const posy = Math.floor(Math.random() * 100).toFixed() + 'px';
  newDiv.style.backgroundColor = color;
  newDiv.style.position = 'absolute';
  newDiv.style.width = divsize;
  newDiv.style.height = divsize;
  newDiv.style.top = posx;
  newDiv.style.left = posy;
  newDiv.draggable = true;

  newDiv.classList.add('draggable-div');
  return newDiv;
}

const addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function (event) {
  event.preventDefault();
  homeworkContainer.appendChild(createDiv());
});
