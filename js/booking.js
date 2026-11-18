// booking.js — handles the availability check and booking form submission.
(function () {
  const form = document.getElementById('booking-form');
  const checkBtn = document.getElementById('check-availability-btn');
  const resultEl = document.getElementById('availability-result');
  const msgEl = document.getElementById('booking-msg');

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }
  document.getElementById('checkin').min = todayStr();
  document.getElementById('checkout').min = todayStr();

  document.getElementById('checkin').addEventListener('change', (e) => {
    document.getElementById('checkout').min = e.target.value;
  });

  async function checkAvailability() {
    const roomKey = document.getElementById('room_key').value;
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;

    resultEl.textContent = '';
    resultEl.className = '';

    if (!roomKey || !checkin || !checkout) {
      resultEl.textContent = 'Pick a room type and both dates first.';
      resultEl.classList.add('no');
      return;
    }
    if (new Date(checkout) <= new Date(checkin)) {
      resultEl.textContent = 'Check-out must be after check-in.';
      resultEl.classList.add('no');
      return;
    }

    checkBtn.disabled = true;
    checkBtn.textContent = 'Checking...';
    try {
      const res = await fetch(
        `/api/rooms/${encodeURIComponent(roomKey)}/availability?checkin=${checkin}&checkout=${checkout}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not check availability.');

      if (data.is_available) {
        resultEl.textContent = `\u2713 ${data.units_available} room(s) available for those dates.`;
        resultEl.classList.add('ok');
      } else {
        resultEl.textContent = '\u2717 Fully booked for those dates. Try different dates.';
        resultEl.classList.add('no');
      }
    } catch (err) {
      resultEl.textContent = err.message;
      resultEl.classList.add('no');
    } finally {
      checkBtn.disabled = false;
      checkBtn.textContent = 'Check availability';
    }
  }

  checkBtn.addEventListener('click', checkAvailability);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgEl.className = 'booking-msg';
    msgEl.textContent = '';

    const payload = {
      room_key: document.getElementById('room_key').value,
      guest_name: document.getElementById('guest_name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      checkin: document.getElementById('checkin').value,
      checkout: document.getElementById('checkout').value,
      adults: parseInt(document.getElementById('adults').value, 10) || 1,
      children: parseInt(document.getElementById('children').value, 10) || 0,
      special_requests: document.getElementById('special_requests').value.trim()
    };

    if (new Date(payload.checkout) <= new Date(payload.checkin)) {
      msgEl.textContent = 'Check-out must be after check-in.';
      msgEl.classList.add('show', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending request...';

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');

      msgEl.textContent = `Thanks, ${payload.guest_name.split(' ')[0]}! Your booking request (#${data.booking.id}) has been received. We'll email you at ${payload.email} once it's confirmed.`;
      msgEl.classList.add('show', 'success');
      form.reset();
      resultEl.textContent = '';
      resultEl.className = '';
    } catch (err) {
      msgEl.textContent = err.message;
      msgEl.classList.add('show', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request Booking';
    }
  });
})();
