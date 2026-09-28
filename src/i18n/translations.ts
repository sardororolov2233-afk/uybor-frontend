export const translations = {
  uz: {
    // Navigation
    'nav.explore': 'Qidiruv',
    'nav.add': "E'lon berish",
    'nav.profile': 'Profil',
    
    // Home & Search
    'search.placeholder': "Joylashuv yoki sarlavha bo'yicha qidirish...",
    'home.newListings': "Yangi e'lonlar",
    'home.vipListings': "VIP e'lonlar",
    'home.featured': "Tavsiya etilgan e'lonlar",
    'home.seeAll': "Hammasi",
    'home.noListings': "Hech qanday e'lon topilmadi.",
    'home.loading': "Yuklanmoqda...",
    
    // Listing Card
    'card.beds': 'xona',
    'card.baths': 'hammom',
    'card.noImage': "Rasm yo'q",
    'card.perMonth': "/ oyiga",
    
    // Details
    'details.month': "oyiga",
    'details.bedrooms': "Xonalar soni",
    'details.bathrooms': "Hammomlar",
    'details.description': "Tavsif",
    'details.contact': "Bog'lanish",
    
    // Add Listing
    'add.title': "Yangi e'lon qo'shish",
    'add.photoHint': "Rasm yuklash uchun bosing",
    'add.fieldTitle': "Sarlavha",
    'add.fieldTitlePlaceholder': "Masalan: Markazda shinam xonadon",
    'add.fieldPrice': "Narxi ($)",
    'add.fieldLocation': "Joylashuv",
    'add.fieldLocationPlaceholder': "Shahar, tuman",
    'add.fieldBeds': "Xonalar soni",
    'add.fieldBaths': "Hammomlar soni",
    'add.fieldDesc': "Tavsif",
    'add.fieldDescPlaceholder': "Uyingiz haqida batafsil ma'lumot bering...",
    'add.submit': "E'lonni joylashtirish",
    'add.success': "E'lon muvaffaqiyatli qo'shildi!",
    'add.error': "Xatolik yuz berdi",
    
    // Profile
    'profile.title': "Mening e'lonlarim",
    'profile.noProperties': "Siz hali e'lon qo'shmadingiz.",
    'profile.language': "Tilni o'zgartirish / Изменить язык",
  },
  ru: {
    // Navigation
    'nav.explore': 'Поиск',
    'nav.add': 'Добавить',
    'nav.profile': 'Профиль',
    
    // Home & Search
    'search.placeholder': 'Поиск по локации или названию...',
    'home.newListings': 'Новые объявления',
    'home.vipListings': 'VIP объявления',
    'home.featured': 'Рекомендуемые',
    'home.seeAll': 'Все',
    'home.noListings': 'Объявления не найдены.',
    'home.loading': 'Загрузка...',
    
    // Listing Card
    'card.beds': 'комн.',
    'card.baths': 'ванн.',
    'card.noImage': 'Нет фото',
    'card.perMonth': '/ в месяц',
    
    // Details
    'details.month': 'в месяц',
    'details.bedrooms': 'Спальни',
    'details.bathrooms': 'Ванные',
    'details.description': 'Описание',
    'details.contact': 'Связаться',
    
    // Add Listing
    'add.title': 'Добавить объявление',
    'add.photoHint': 'Нажмите, чтобы добавить фото',
    'add.fieldTitle': 'Название',
    'add.fieldTitlePlaceholder': 'Например: Уютная квартира в центре',
    'add.fieldPrice': 'Цена ($)',
    'add.fieldLocation': 'Локация',
    'add.fieldLocationPlaceholder': 'Город, район',
    'add.fieldBeds': 'Количество комнат',
    'add.fieldBaths': 'Количество санузлов',
    'add.fieldDesc': 'Описание',
    'add.fieldDescPlaceholder': 'Опишите ваше жилье подробно...',
    'add.submit': 'Опубликовать объявление',
    'add.success': 'Объявление успешно добавлено!',
    'add.error': 'Произошла ошибка',
    
    // Profile
    'profile.title': 'Мои объявления',
    'profile.noProperties': 'У вас пока нет объявлений.',
    'profile.language': 'Изменить язык / Tilni o\'zgartirish',
  }
};

export type Language = 'uz' | 'ru';
export type TranslationKey = keyof typeof translations.uz;
