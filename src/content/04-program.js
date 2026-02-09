import { resolveImageAsset } from './assets.js';

(function registerProgramContent() {
  window.Landing = window.Landing || {};
  window.Landing.content = window.Landing.content || {};

  window.Landing.content.program = {
    title: 'Программа: путь трансформации',
    text:
      'Как косметологу применять ИИ в рабочих задачах — быстро, безопасно и эффективно. Каждый вебинар — это новый слой вашей системы.',
    actions: {
      primary: 'Купить пакет со скидкой',
      primaryUrl: '#pricing-full-package',
      secondary: 'Выбрать отдельные вебинары'
    },
    mobileNote: 'Вам не нужен компьютер. Повторяйте за нами с телефона в реальном времени.',
    webinars: [
      {
        step: 'Шаг 1 из 6',
        title: 'Вебинар 1. Введение в ИИ',
        date: '10 марта, 19:00 (МСК)',
        previewImage: resolveImageAsset('program-collapsed/webinar-1.webp'),
        subtitle: 'Первый контент без стресса: фото + 3 поста за один вечер',
        text: 'На вебинаре мы за 5 минут превратим обычный кадр с телефона в аккуратную картинку, а идею — в готовый текст для поста.',
        learn: [
          'Убирать визуальный шум: провода, лишние детали, чистый фон.',
          'Работать в простых ИИ-программах: 3 кнопки для профессионального результата.',
          'Писать посты без усилий: инструкции для готовых текстов.'
        ],
        images: [
          resolveImageAsset('program-collapsed/webinar-1.webp'),
          resolveImageAsset('program-expanded/webinar-1.webp')
        ]
      },
      {
        step: 'Шаг 2 из 6',
        title: 'Вебинар 2. Текст — Голос',
        date: '17 марта, 19:00 (МСК)',
        previewImage: resolveImageAsset('program-collapsed/webinar-2.webp'),
        subtitle: 'Ваш аккаунт заговорил. Появились смыслы.',
        text: 'Генерируйте посты любого формата: продающие, экспертные, вовлекающие. Адаптируйте тон под аудиторию без потери естественности. Проводите исследования. Задавайте "чату" вопросы. Получите личного ассистента на каждый день.',
        learn: [
          'Генерировать посты любого формата за 15 минут.',
          'Формировать стратегии и проводить исследования.',
          'Строить серии контента на недели вперёд.'
        ],
        images: [
          resolveImageAsset('program-collapsed/webinar-2.webp'),
          resolveImageAsset('program-expanded/webinar-2.webp')
        ]
      },
      {
        step: 'Шаг 3 из 6',
        title: 'Вебинар 3. Фото-профи — Стиль',
        date: '24 марта, 19:00 (МСК)',
        previewImage: resolveImageAsset('program-collapsed/webinar-3.webp'),
        subtitle: 'Профиль обрёл айдентику. Он выглядит дорого и цельно.',
        text: 'Вы настроите визуальный стиль профиля, научитесь добиваться реалистичной картинки и уйдёте от эффекта «дешёвого ИИ».',
        learn: [
          'Разрабатывать персональную бренд-стилистику.',
          'Убирать эффект "дешевого ИИ".',
          'Профессионально работать со светом, тенями и реалистичностью.'
        ],
        images: [
          resolveImageAsset('program-collapsed/webinar-3.webp'),
          resolveImageAsset('program-expanded/webinar-3.webp')
        ]
      },
      {
        step: 'Шаг 4 из 6',
        title: 'Вебинар 4. Видео — Динамика',
        date: '31 марта, 19:00 (МСК)',
        previewImage: resolveImageAsset('program-collapsed/webinar-4.webp'),
        subtitle: 'Статичная картинка превратилась в охватный ролик.',
        text: 'Reels — ключевой инструмент охвата. Создавайте видео из фото или текста за 10 минут без съёмочной команды.',
        learn: [
          'Создавать Reels из фото за 10 минут.',
          'Генерировать видео по текстовому описанию.',
          'Вставлять музыку, эффекты и субтитры автоматически.'
        ],
        images: [
          resolveImageAsset('program-collapsed/webinar-4.webp'),
          resolveImageAsset('program-expanded/webinar-4.webp')
        ]
      },
      {
        step: 'Шаг 5 из 6',
        title: 'Вебинар 5. Аватар — Масштаб',
        date: '7 апреля, 19:00 (МСК)',
        previewImage: resolveImageAsset('program-collapsed/webinar-5.webp'),
        subtitle: 'Вы работаете, а ваш цифровой двойник вещает в сторис.',
        text: 'Цифровой аватар — мощный инструмент масштабирования. Превращайте идеи в живые видео с вашим голосом и лицом.',
        learn: [
          'Создавать цифровой двойник за 1 день.',
          'Превращать тексты в живые видео с вашим голосом.',
          'Масштабировать контент без постоянных съёмок.'
        ],
        images: [
          resolveImageAsset('program-collapsed/webinar-5.webp'),
          resolveImageAsset('program-expanded/webinar-5.webp')
        ]
      },
      {
        step: 'Шаг 6 из 6',
        title: 'Вебинар 6. Маркетинг и лиды',
        date: '14 апреля, 19:00 (МСК)',
        previewImage: resolveImageAsset('program-collapsed/webinar-6.webp'),
        subtitle: 'Контент → заявки: воронка, ответы клиентам и аналитика в Instagram с ИИ.',
        text: 'Финальный элемент: как связать посты/Reels/аватар с записью, не терять лидов в директ и понимать, что реально работает.',
        learn: [
          'Собрать Instagram-воронку: контент → CTA → директ → запись.',
          'Использовать скрипты и ответы в Direct с помощью ИИ.',
          'Вести учёт и аналитику: лиды, конверсия, улучшение результата.'
        ],
        images: [
          resolveImageAsset('program-collapsed/webinar-6.webp'),
          resolveImageAsset('program-expanded/webinar-6.webp')
        ]
      }
    ]
  };
})();
