// Функция автоматического выбора авто при клике в каталоге
function selectCar(index) {
    const carSelect = document.getElementById('car-class');
    if (carSelect) {
        carSelect.selectedIndex = index;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('booking-form');
    const ordersTbody = document.getElementById('orders-tbody');
    const tabProfileRadio = document.getElementById('tab-profile');

    // Демо-данные по умолчанию
    const defaultOrders = [
        { car: 'Geely Coolray', period: '24.10.2026 — 25.10.2026', price: '8 000 руб.', status: 'confirmed', statusText: 'Подтверждено' },
        { car: 'Hyundai Solaris', period: '01.10.2026 — 05.10.2026', price: '10 000 руб.', status: 'completed', statusText: 'Завершена' }
    ];

    // Загрузка заказов из локальной памяти браузера или демонстрационных данных
    let orders = JSON.parse(localStorage.getItem('autoDriveOrders')) || defaultOrders;

    // Отображение таблицы заказов
    function renderOrders() {
        if (!ordersTbody) return;
        ordersTbody.innerHTML = ''; // Очищаем старые строки перед рендером

        orders.forEach((order, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.car}</td>
                <td>${order.period}</td>
                <td>${order.price}</td>
                <td><span class="status ${order.status}">${order.statusText}</span></td>
                <td>
                    ${order.status === 'confirmed' ? `<button class="delete-btn" onclick="cancelOrder(${index})">Отменить</button>` : '—'}
                </td>
            `;
            ordersTbody.appendChild(tr);
        });
    }

    // Исправленная функция форматирования даты (из YYYY-MM-DD в DD.MM.YYYY)
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-'); // [0]=YYYY, [1]=MM, [2]=DD
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}.${parts[1]}.${parts[0]}`; // Собираем обратно корректно
    }

    // Глобальная функция для отмены заказа
    window.cancelOrder = function(index) {
        if (confirm('Вы уверены, что хотите отменить эту бронь?')) {
            orders.splice(index, 1);
            localStorage.setItem('autoDriveOrders', JSON.stringify(orders));
            renderOrders();
        }
    }

    // Обработка отправки формы
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const carSelect = document.getElementById('car-class');
            const selectedCarText = carSelect.options[carSelect.selectedIndex].text;
            const pricePerDay = parseInt(carSelect.value);
            
            const startDateStr = document.getElementById('start-date').value;
            const endDateStr = document.getElementById('end-date').value;

            // Валидация дат
            const start = new Date(startDateStr);
            const end = new Date(endDateStr);

            if (end < start) {
                alert('Ошибка: Дата возврата не может быть раньше даты начала аренды!');
                return;
            }

            // Расчет количества дней и итоговой стоимости
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; 
            const totalPrice = (diffDays * pricePerDay).toLocaleString('ru-RU') + ' руб.';

            // Извлекаем только название авто (убираем приписку класса из option)
            const carName = selectedCarText.substring(selectedCarText.indexOf('(') + 1, selectedCarText.indexOf(')'));

            // Создаем новый заказ
            const newOrder = {
                car: carName,
                period: `${formatDate(startDateStr)} — ${formatDate(endDateStr)}`,
                price: totalPrice,
                status: 'confirmed',
                statusText: 'Подтверждено'
            };

            // Добавляем в начало списка, сохраняем и обновляем экран
            orders.unshift(newOrder);
            localStorage.setItem('autoDriveOrders', JSON.stringify(orders));
            renderOrders();

            // Сброс полей формы
            bookingForm.reset();

            // Программное переключение CSS вкладки на "Мои поездки"
            if (tabProfileRadio) {
                tabProfileRadio.checked = true;
            }
        });
    }

    // Первый рендер при загрузке страницы
    renderOrders();
});
