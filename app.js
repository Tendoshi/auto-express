// ==========================================
// 1. BASE DE DONNÉES PAR DÉFAUT
// ==========================================
const defaultCars = [
    {
        id: 'kia-sportage-2022',
        brand: 'Kia',
        model: 'Sportage',
        year: '2022',
        category: 'SUV',
        fuel: 'Essence (4 Cyl.)',
        transmission: 'Automatique',
        km: '25 000 km',
        priceVente: '13 500 000',
        priceLocation: '45 000',
        images: [
            'images/kia-sportage/1.jpg',
            'images/kia-sportage/2.jpg',
            'images/kia-sportage/3.jpg',
            'images/kia-sportage/4.jpg',
            'images/kia-sportage/5.jpg',
            'images/kia-sportage/6.jpg',
            'images/kia-sportage/7.jpg',
            'images/kia-sportage/8.jpg',
            'images/kia-sportage/9.jpg',
            'images/kia-sportage/10.jpg',
            'images/kia-sportage/11.jpg',
            'images/kia-sportage/12.jpg',
            'images/kia-sportage/13.jpg',
            'images/kia-sportage/14.jpg'
        ]
    },
    {
        id: 'jeep-sahara-2024',
        brand: 'Jeep',
        model: 'Wrangler Sahara',
        year: '2024',
        category: 'SUV',
        fuel: 'Essence Hybride',
        transmission: 'Automatique',
        km: '5 000 km',
        priceVente: '45 000 000',
        priceLocation: '100 000',
        images: [
            'images/jeep-sahara/1.jpg',
            'images/jeep-sahara/2.jpg',
            'images/jeep-sahara/3.jpg',
            'images/jeep-sahara/4.jpg',
            'images/jeep-sahara/5.jpg',
            'images/jeep-sahara/6.jpg',
            'images/jeep-sahara/7.jpg',
            'images/jeep-sahara/8.jpg',
            'images/jeep-sahara/9.jpg',
            'images/jeep-sahara/10.jpg',
            'images/jeep-sahara/11.jpg',
            'images/jeep-sahara/12.jpg'
        ]
    },
    {
        id: 'kia-k5-2022',
        brand: 'Kia',
        model: 'K5',
        year: '2022',
        category: 'Berline',
        fuel: 'Essence',
        transmission: 'Automatique',
        km: '18 000 km',
        priceVente: '14 000 000',
        priceLocation: '50 000',
        images: [
            'images/kia-k5/1.jpg',
            'images/kia-k5/2.jpg',
            'images/kia-k5/3.jpg',
            'images/kia-k5/4.jpg',
            'images/kia-k5/5.jpg',
            'images/kia-k5/6.jpg',
            'images/kia-k5/7.jpg',
            'images/kia-k5/8.jpg',
            'images/kia-k5/9.jpg',
            'images/kia-k5/10.jpg',
            'images/kia-k5/11.jpg',
            'images/kia-k5/12.jpg'
        ]
    }
];

// Synchronisation avec le localStorage (connexion avec admin.html)
if (!localStorage.getItem('auto_express_cars')) {
    localStorage.setItem('auto_express_cars', JSON.stringify(defaultCars));
}

let cars = JSON.parse(localStorage.getItem('auto_express_cars')) || defaultCars;

// État de l'application
let currentMode = 'vente'; // 'vente' ou 'location'
let selectedCar = null;

// ==========================================
// 2. INITIALISATION AU CHARGEMENT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderCars(cars);
});

// ==========================================
// 3. AFFICHAGE DES CARTES DE VÉHICULES
// ==========================================
function renderCars(carList) {
    const grid = document.getElementById('car-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (carList.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-white/40 text-xs uppercase tracking-widest">
                Aucun véhicule ne correspond à votre recherche.
            </div>
        `;
        return;
    }

    carList.forEach(car => {
        const isVente = currentMode === 'vente';
        const priceDisplay = isVente 
            ? `${car.priceVente} FCFA` 
            : `${car.priceLocation} FCFA / jour`;
        
        const priceLabel = isVente ? 'PRIX COMPTANT' : 'PRIX LOCATION';
        const photoCount = car.images ? car.images.length : 0;
        const mainImg = (car.images && car.images.length > 0) ? car.images[0] : '';

        const carCard = document.createElement('div');
        carCard.className = 'bg-[#131924] border border-[#1d2636] rounded-xl overflow-hidden hover:border-white/30 transition-all duration-300 flex flex-col justify-between';

        carCard.innerHTML = `
            <div>
                <!-- Image & Badges (Fond flouté + Véhicule entier) -->
                <div class="relative h-56 bg-[#0c1017] overflow-hidden flex items-center justify-center">
                    <!-- Arrière-plan flouté pour remplir le cadre -->
                    <img src="${mainImg}" class="absolute inset-0 w-full h-full object-cover blur-lg opacity-30 scale-110" alt="">
                    
                    <!-- Image principale nette et non coupée -->
                    <img src="${mainImg}" alt="${car.brand} ${car.model}" class="relative z-10 w-full h-full object-contain p-2">
                    
                    <span class="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-white uppercase border border-white/10">
                        ${car.category}
                    </span>

                    <span class="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-medium tracking-wider text-white/80 uppercase border border-white/10">
                        📷 ${photoCount} photos
                    </span>
                </div>

                <!-- Infos Véhicule -->
                <div class="p-6">
                    <h3 class="text-lg font-bold text-white font-heading mb-4 tracking-wide">
                        ${car.brand} ${car.model} (${car.year})
                    </h3>

                    <div class="grid grid-cols-3 gap-2 bg-[#0c1017] p-3 rounded-lg border border-[#1d2636] text-center text-[10px] mb-6">
                        <div>
                            <span class="text-white/40 uppercase block font-medium">Moteur</span>
                            <span class="font-bold text-white/90 truncate block mt-0.5">${car.fuel}</span>
                        </div>
                        <div>
                            <span class="text-white/40 uppercase block font-medium">Boîte</span>
                            <span class="font-bold text-white/90 truncate block mt-0.5">${car.transmission}</span>
                        </div>
                        <div>
                            <span class="text-white/40 uppercase block font-medium">Année</span>
                            <span class="font-bold text-white/90 truncate block mt-0.5">${car.year}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Prix & Bouton Action -->
            <div class="px-6 pb-6 pt-2 border-t border-[#1d2636]/50 flex items-center justify-between gap-4">
                <div>
                    <span class="text-[9px] font-bold text-white/40 uppercase tracking-widest block">${priceLabel}</span>
                    <span class="text-sm sm:text-base font-black text-white tracking-tight">${priceDisplay}</span>
                </div>

                <button onclick="openModal('${car.id}')" class="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all duration-300">
                    Voir la fiche
                </button>
            </div>
        `;

        grid.appendChild(carCard);
    });
}

// ==========================================
// 4. MODALE & GALERIE DE PHOTOS
// ==========================================
function openModal(carId) {
    cars = JSON.parse(localStorage.getItem('auto_express_cars')) || defaultCars;
    selectedCar = cars.find(c => c.id === carId);
    if (!selectedCar) return;

    const modal = document.getElementById('modal');
    if (!modal) return;

    document.getElementById('modal-title').textContent = `${selectedCar.brand} ${selectedCar.model} (${selectedCar.year})`;
    document.getElementById('modal-tag').textContent = selectedCar.category;

    const isVente = currentMode === 'vente';
    document.getElementById('modal-price').textContent = isVente 
        ? `${selectedCar.priceVente} FCFA` 
        : `${selectedCar.priceLocation} FCFA / jour`;

    document.getElementById('spec-fuel').textContent = selectedCar.fuel;
    document.getElementById('spec-trans').textContent = selectedCar.transmission;
    document.getElementById('spec-year').textContent = selectedCar.year;
    document.getElementById('spec-km').textContent = selectedCar.km;

    const mainImg = document.getElementById('modal-main-img');
    if (selectedCar.images && selectedCar.images.length > 0) {
        mainImg.src = selectedCar.images[0];
    }

    const thumbnailsContainer = document.getElementById('modal-thumbnails');
    thumbnailsContainer.innerHTML = '';

    if (selectedCar.images) {
        selectedCar.images.forEach((imgSrc, index) => {
            const thumb = document.createElement('img');
            thumb.src = imgSrc;
            thumb.className = `w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${index === 0 ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`;
            
            thumb.onclick = () => {
                mainImg.src = imgSrc;
                const allThumbs = thumbnailsContainer.querySelectorAll('img');
                allThumbs.forEach(t => {
                    t.classList.remove('border-white', 'opacity-100');
                    t.classList.add('border-transparent', 'opacity-50');
                });
                thumb.classList.remove('border-transparent', 'opacity-50');
                thumb.classList.add('border-white', 'opacity-100');
            };

            thumbnailsContainer.appendChild(thumb);
        });
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
};

// ==========================================
// 5. BASCULEMENT MODE VENTE / LOCATION
// ==========================================
function setMode(mode) {
    currentMode = mode;

    const btnVente = document.getElementById('btn-mode-vente');
    const btnLocation = document.getElementById('btn-mode-location');
    const indicator = document.getElementById('mode-indicator');

    if (mode === 'vente') {
        btnVente?.classList.add('bg-white', 'text-black');
        btnVente?.classList.remove('text-white/50');
        
        btnLocation?.classList.remove('bg-white', 'text-black');
        btnLocation?.classList.add('text-white/50');

        if (indicator) indicator.textContent = 'MODE ACHAT';
    } else {
        btnLocation?.classList.add('bg-white', 'text-black');
        btnLocation?.classList.remove('text-white/50');

        btnVente?.classList.remove('bg-white', 'text-black');
        btnVente?.classList.add('text-white/50');

        if (indicator) indicator.textContent = 'MODE LOCATION';
    }

    applyFilters();
}

// ==========================================
// 6. FILTRES DE RECHERCHE ET CATÉGORIES
// ==========================================
function applyFilters() {
    cars = JSON.parse(localStorage.getItem('auto_express_cars')) || defaultCars;

    const searchVal = document.getElementById('filter-search')?.value.toLowerCase() || '';
    const catVal = document.getElementById('filter-category')?.value || 'all';
    const fuelVal = document.getElementById('filter-fuel')?.value || 'all';

    const filtered = cars.filter(car => {
        if (currentMode === 'vente' && car.offerType === 'location') return false;
        if (currentMode === 'location' && car.offerType === 'vente') return false;

        const matchesSearch = `${car.brand} ${car.model}`.toLowerCase().includes(searchVal);
        const matchesCat = (catVal === 'all') || (car.category === catVal);
        const matchesFuel = (fuelVal === 'all') || (car.fuel === fuelVal);

        return matchesSearch && matchesCat && matchesFuel;
    });

    renderCars(filtered);
}

// ==========================================
// 7. ENVOI PAR WHATSAPP
// ==========================================
function sendWhatsAppOrder(e) {
    e.preventDefault();
    if (!selectedCar) return;

    const clientName = document.getElementById('client-name').value;
    const phoneNumber = "2250142654427"; 

    const typeMsg = currentMode === 'vente' ? 'l\'ACHAT' : 'la LOCATION';
    const priceMsg = currentMode === 'vente' ? `${selectedCar.priceVente} FCFA` : `${selectedCar.priceLocation} FCFA / jour`;

    const message = `Bonjour Auto Express, je suis *${clientName}*.\n\nJe suis intéressé(e) par *${typeMsg}* du véhicule suivant :\n🚘 *${selectedCar.brand} ${selectedCar.model} (${selectedCar.year})*\n💰 Prix : ${priceMsg}\n\nMerci de me recontacter pour finaliser la procédure.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
}