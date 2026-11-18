// chatbot.js — a simple rule-based FAQ assistant. No API key or backend call required;
// it matches keywords in the guest's message against a set of resort FAQs.
(function () {
  const toggleBtn = document.getElementById('chatbot-toggle');
  const closeBtn = document.getElementById('chatbot-close');
  const panel = document.getElementById('chatbot-panel');
  const messagesEl = document.getElementById('chatbot-messages');
  const quickRepliesEl = document.getElementById('chat-quick-replies');
  const inputForm = document.getElementById('chatbot-input-form');
  const input = document.getElementById('chatbot-input');

  const FAQS = [
    {
      id: 'rooms',
      label: 'Room types',
      keywords: ['room', 'rooms', 'accommodation', 'suite', 'deluxe', 'standard', 'sleep', 'stay overnight'],
      answer: "We have three room types in our guest building: Standard, Deluxe, and the Beachfront Suite. You can see photos, prices, and capacity in the Rooms section — scroll to 'Rooms for every kind of trip' or tap the button below."
    },
    {
      id: 'rates',
      label: 'Rates & prices',
      keywords: ['rate', 'rates', 'price', 'prices', 'cost', 'how much', 'fee'],
      answer: "Room rates currently range from \u20b13,200/night (Standard) to \u20b17,500/night (Beachfront Suite). Exact pricing is shown per room in the Rooms section, and totals are confirmed when you submit a booking request."
    },
    {
      id: 'beach',
      label: 'The beach',
      keywords: ['beach', 'shore', 'shoreline', 'sea', 'ocean', 'sand'],
      answer: "Our private beach is open to all overnight guests and day-trippers. It's a short walk from the pool, jacuzzi, and rooms building — take a look at the Amenities gallery for photos."
    },
    {
      id: 'pool',
      label: 'Swimming pool',
      keywords: ['pool', 'swim', 'swimming'],
      answer: "The swimming pool is open daily and free to use for all guests staying overnight. Day-use guests can also access it — just ask our front desk about day-pass details."
    },
    {
      id: 'jacuzzi',
      label: 'Jacuzzi',
      keywords: ['jacuzzi', 'hot tub', 'spa', 'whirlpool'],
      answer: "The jacuzzi deck sits right next to the pool and is available to overnight guests. It's especially nice in the evening — quieter, and the water's warm."
    },
    {
      id: 'checkinout',
      label: 'Check-in / check-out',
      keywords: ['check-in', 'checkin', 'check in', 'check-out', 'checkout', 'check out', 'arrival', 'departure', 'what time'],
      answer: "Standard check-in is from 2:00 PM and check-out is by 12:00 PM (noon). If you need an early check-in or late check-out, mention it in the 'special requests' field on the booking form and we'll do our best to accommodate you."
    },
    {
      id: 'booking',
      label: 'How to book',
      keywords: ['book', 'booking', 'reserve', 'reservation', 'availability'],
      answer: "You can book right here on the site: pick a room, choose your dates in the Booking section, check availability, then submit your details. We'll follow up by email to confirm."
    },
    {
      id: 'cancellation',
      label: 'Cancellations',
      keywords: ['cancel', 'cancellation', 'refund', 'reschedule', 'change dates'],
      answer: "For cancellations or date changes, please contact us directly by email or phone with your booking reference so our team can update it for you."
    },
    {
      id: 'contact',
      label: 'Contact info',
      keywords: ['contact', 'phone', 'email', 'address', 'location', 'where are you', 'call'],
      answer: "You'll find our address, email, and phone number in the footer at the bottom of this page, under 'Get in touch'."
    },
    {
      id: 'parking',
      label: 'Parking & Wi-Fi',
      keywords: ['parking', 'wifi', 'wi-fi', 'internet', 'car'],
      answer: "Free on-site parking and Wi-Fi are available to all overnight guests throughout the resort."
    },
    {
      id: 'pets',
      label: 'Pets',
      keywords: ['pet', 'pets', 'dog', 'cat', 'animal'],
      answer: "We're not currently set up for pets, but feel free to contact us directly if you have a specific situation — we're happy to talk it through."
    }
  ];

  const GREETING =
    "Hi! I'm Arlyn's Assistant. Ask me about rooms, rates, the beach, pool, jacuzzi, or how to book \u2014 or tap one of the quick options below.";

  const QUICK_IDS = ['rooms', 'rates', 'jacuzzi', 'booking', 'checkinout', 'contact'];

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `msg ${sender}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderQuickReplies() {
    quickRepliesEl.innerHTML = '';
    QUICK_IDS.forEach((id) => {
      const faq = FAQS.find((f) => f.id === id);
      if (!faq) return;
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.type = 'button';
      chip.textContent = faq.label;
      chip.addEventListener('click', () => {
        addMessage(faq.label, 'user');
        addMessage(faq.answer, 'bot');
      });
      quickRepliesEl.appendChild(chip);
    });
  }

  function findAnswer(message) {
    const text = message.toLowerCase();
    let best = null;
    let bestScore = 0;
    FAQS.forEach((faq) => {
      const score = faq.keywords.filter((k) => text.includes(k)).length;
      if (score > bestScore) {
        bestScore = score;
        best = faq;
      }
    });
    if (best) return best.answer;
    return "I don't have an exact answer for that, but our front desk can help \u2014 see the contact details in the footer. You can also try asking about rooms, rates, the beach, pool, jacuzzi, or booking.";
  }

  let initialized = false;
  function openChat() {
    panel.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    if (!initialized) {
      addMessage(GREETING, 'bot');
      renderQuickReplies();
      initialized = true;
    }
    input.focus();
  }
  function closeChat() {
    panel.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', () => {
    panel.classList.contains('open') ? closeChat() : openChat();
  });
  closeBtn.addEventListener('click', closeChat);

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    setTimeout(() => addMessage(findAnswer(text), 'bot'), 300);
  });
})();
