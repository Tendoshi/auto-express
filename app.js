// ==========================================
// 1. BASE DE DONNÉES PAR DÉFAUT & ÉTAT GLOBAL
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

let allCars = [];
let currentMode = 'vente';
let selectedCar = null;

// ==========================================
// 2. INITIALISATION ET CHARGEMENT (FIRESTORE)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    fetchCarsFromFirestore();
});

async function fetchCarsFromFirestore() {
    const grid = document.getElementById('car-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-white/40 text-xs uppercase tracking-widest">
                Chargement des véhicules...
            </div>
        `;
    }

    try {
        if (typeof db !== 'undefined') {
            const snapshot = await db.collection('cars').get();
            if (!snapshot.empty) {
                allCars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                allCars = [...defaultCars];
            }
        } else {
            allCars = JSON.parse(localStorage.getItem('auto_express_cars')) || defaultCars;
        }
    } catch (error) {
        console.error('Erreur Firestore :', error);
        allCars = JSON.parse(localStorage.getItem('auto_express_cars')) || defaultCars;
    }

    applyFilters();
}

// ==========================================
// 3. AFFICHAGE DES CARTES DE VÉHICULES
// ==========================================
function renderCars(carList) {
    const grid = document.getElementById('car-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // Détection : si la page n'est pas "catalogue.html", c'est la page d'accueil (limite à 3)
    const isCataloguePage = document.body.classList.contains('page-catalogue');
    const carsToDisplay = isCataloguePage ? carList : carList.slice(0, 3);

    if (carsToDisplay.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-white/40 text-xs uppercase tracking-widest">
                Aucun véhicule ne correspond à votre recherche.
            </div>
        `;
        return;
    }

    carsToDisplay.forEach(car => {
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
                <!-- Image & Badges -->
                <div class="relative h-56 bg-[#0c1017] overflow-hidden flex items-center justify-center">
                    <img src="${mainImg}" class="absolute inset-0 w-full h-full object-cover blur-lg opacity-30 scale-110" alt="">
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
window.openModal = function(carId) {
    selectedCar = allCars.find(c => c.id === carId);
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
};

window.closeModal = function() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }
};

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
};

// ==========================================
// 5. BASCULEMENT MODE VENTE / LOCATION
// ==========================================
window.setMode = function(mode) {
    currentMode = mode;

    const btnVente = document.getElementById('btn-mode-vente');
    const btnLocation = document.getElementById('btn-mode-location');
    const indicator = document.getElementById('mode-indicator');

    if (!btnVente || !btnLocation) return;

    if (mode === 'vente') {
        btnVente.className = "px-4 py-2 bg-white text-black font-bold transition-all";
        btnLocation.className = "px-4 py-2 text-white/50 hover:text-white transition-all";

        if (indicator) indicator.textContent = 'MODE ACHAT';
    } else {
        btnLocation.className = "px-4 py-2 bg-white text-black font-bold transition-all";
        btnVente.className = "px-4 py-2 text-white/50 hover:text-white transition-all";

        if (indicator) indicator.textContent = 'MODE LOCATION';
    }

    applyFilters();
};

// ==========================================
// 6. FILTRES DE RECHERCHE ET CATÉGORIES
// ==========================================
window.applyFilters = function() {
    const searchVal = document.getElementById('filter-search')?.value.toLowerCase() || '';
    const catVal = document.getElementById('filter-category')?.value || 'all';
    const fuelVal = document.getElementById('filter-fuel')?.value || 'all';

    const filtered = allCars.filter(car => {
        if (currentMode === 'vente' && car.offerType === 'location') return false;
        if (currentMode === 'location' && car.offerType === 'vente') return false;

        const matchesSearch = `${car.brand} ${car.model}`.toLowerCase().includes(searchVal);
        const matchesCat = (catVal === 'all') || (car.category === catVal);
        const matchesFuel = (fuelVal === 'all') || (car.fuel === fuelVal || car.fuel.includes(fuelVal));

        return matchesSearch && matchesCat && matchesFuel;
    });

    renderCars(filtered);
};

// ==========================================
// 7. ENVOI PAR WHATSAPP
// ==========================================
window.sendWhatsAppOrder = function(e) {
    e.preventDefault();
    if (!selectedCar) return;

    const clientName = document.getElementById('client-name').value;
    const phoneNumber = "2250142654427"; 

    const typeMsg = currentMode === 'vente' ? 'l\'ACHAT' : 'la LOCATION';
    const priceMsg = currentMode === 'vente' ? `${selectedCar.priceVente} FCFA` : `${selectedCar.priceLocation} FCFA / jour`;

    const message = `Bonjour Auto Express, je suis *${clientName}*.\n\nJe suis intéressé(e) par *${typeMsg}* du véhicule suivant :\n🚘 *${selectedCar.brand} ${selectedCar.model} (${selectedCar.year})*\n💰 Prix : ${priceMsg}\n\nMerci de me recontacter pour finaliser la procédure.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
};