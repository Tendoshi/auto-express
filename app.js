// ==========================================
// 1. CHARGEMENT DEPUIS FIREBASE FIRESTORE & LOCALSTORAGE
// ==========================================
async function getStoredCars() {
    let cars = [];

    // 1. Charger depuis Firebase Firestore
    try {
        if (typeof db !== 'undefined') {
            const snapshot = await db.collection('cars').get();
            snapshot.forEach(doc => {
                cars.push({ id: doc.id, ...doc.data() });
            });
        }
    } catch (e) {
        console.warn("Firebase non disponible, bascule sur localStorage", e);
    }

    // 2. Si Firebase n'a rien renvoyé (ou en cas d'erreur), lire localStorage
    if (cars.length === 0) {
        const data = localStorage.getItem('auto_express_cars');
        if (data) {
            try {
                cars = JSON.parse(data);
            } catch (e) {
                console.error("Erreur de lecture du localStorage", e);
            }
        }
    }

    // 3. Normaliser les données (champs par défaut et prix)
    return cars.map(car => {
        let offerType = car.type || car.offerType;
        if (!offerType) {
            const hasVente = car.priceVente && car.priceVente !== 'N/A' && car.priceVente !== 'null';
            const hasLoc = car.priceLocation && car.priceLocation !== 'N/A' && car.priceLocation !== 'null';

            if (hasVente && hasLoc) offerType = 'vente_location';
            else if (hasLoc) offerType = 'location';
            else offerType = 'vente';
        }

        return {
            ...car,
            brand: car.brand || 'Marque inconnue',
            model: car.model || '',
            year: car.year || 'N/A',
            category: car.category || 'Toutes catégories',
            fuel: car.fuel || 'Essence',
            transmission: car.transmission || 'Automatique',
            km: car.km || 'N/A',
            images: Array.isArray(car.images) && car.images.length > 0 ? car.images : [],
            type: offerType,
            priceVente: car.priceVente && car.priceVente !== 'null' ? car.priceVente : (car.price || 'Sur demande'),
            priceLocation: car.priceLocation && car.priceLocation !== 'null' ? car.priceLocation : 'Sur demande'
        };
    });
}

let currentMode = 'vente';
let selectedCar = null;
let allCarsList = [];

const isCataloguePage = document.body.classList.contains('page-catalogue');

// ==========================================
// 2. INITIALISATION ET SYNCHRONISATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    allCarsList = await getStoredCars();
    applyFilters();
});

window.addEventListener('storage', async (e) => {
    if (e.key === 'auto_express_cars') {
        allCarsList = await getStoredCars();
        applyFilters();
    }
});

// ==========================================
// 3. AFFICHAGE DES VÉHICULES
// ==========================================
function renderCars(carList) {
    const grid = document.getElementById('car-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (carList.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-white/40 text-xs uppercase tracking-widest">
                Aucun véhicule disponible dans cette section.
            </div>
        `;
        return;
    }

    const carsToDisplay = isCataloguePage ? carList : carList.slice(0, 3);

    carsToDisplay.forEach(car => {
        const isVente = currentMode === 'vente';
        const priceDisplay = isVente 
            ? `${car.priceVente} FCFA` 
            : `${car.priceLocation} FCFA / jour`;
        
        const priceLabel = isVente ? 'PRIX COMPTANT' : 'PRIX LOCATION';
        const photoCount = car.images ? car.images.length : 0;
        const mainImg = photoCount > 0 ? car.images[0] : 'https://via.placeholder.com/600x400?text=Image+non+disponible';

        const carCard = document.createElement('div');
        carCard.className = 'bg-[#131924] border border-[#1d2636] rounded-xl overflow-hidden hover:border-white/30 transition-all duration-300 flex flex-col justify-between';

        carCard.innerHTML = `
            <div>
                <div class="relative h-56 bg-[#0c1017] overflow-hidden">
                    <img src="${mainImg}" alt="${car.brand} ${car.model}" class="w-full h-full object-cover">
                    
                    <span class="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-white uppercase border border-white/10">
                        ${car.category}
                    </span>

                    <span class="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-medium tracking-wider text-white/80 uppercase border border-white/10">
                        📷 ${photoCount} photos
                    </span>
                </div>

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
// 4. FILTRES DE RECHERCHE ET D'OFFRE
// ==========================================
function applyFilters() {
    const searchInput = document.getElementById('filter-search');
    const categorySelect = document.getElementById('filter-category');
    const fuelSelect = document.getElementById('filter-fuel');

    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
    const catVal = categorySelect ? categorySelect.value : 'all';
    const fuelVal = fuelSelect ? fuelSelect.value : 'all';

    const filtered = allCarsList.filter(car => {
        if (currentMode === 'vente' && car.type === 'location') return false;
        if (currentMode === 'location' && car.type === 'vente') return false;

        const brandModel = `${car.brand} ${car.model}`.toLowerCase();
        const matchesSearch = brandModel.includes(searchVal);
        const matchesCat = (catVal === 'all') || (car.category === catVal);
        const matchesFuel = (fuelVal === 'all') || (car.fuel && car.fuel.toLowerCase().includes(fuelVal.toLowerCase()));

        return matchesSearch && matchesCat && matchesFuel;
    });

    renderCars(filtered);
}

// ==========================================
// 5. BASCULEMENT MODE VENTE / LOCATION
// ==========================================
function setMode(mode) {
    currentMode = mode;

    const btnVente = document.getElementById('btn-mode-vente');
    const btnLocation = document.getElementById('btn-mode-location');

    if (mode === 'vente') {
        btnVente?.classList.add('bg-white', 'text-black', 'font-bold');
        btnVente?.classList.remove('text-white/50');
        
        btnLocation?.classList.remove('bg-white', 'text-black', 'font-bold');
        btnLocation?.classList.add('text-white/50');
    } else {
        btnLocation?.classList.add('bg-white', 'text-black', 'font-bold');
        btnLocation?.classList.remove('text-white/50');

        btnVente?.classList.remove('bg-white', 'text-black', 'font-bold');
        btnVente?.classList.add('text-white/50');
    }

    applyFilters();
}

// ==========================================
// 6. MODALE & GALERIE DE PHOTOS
// ==========================================
function openModal(carId) {
    selectedCar = allCarsList.find(c => String(c.id) === String(carId));
    if (!selectedCar) return;

    const modal = document.getElementById('modal');
    if (!modal) return;

    const titleEl = document.getElementById('modal-title');
    if (titleEl) titleEl.textContent = `${selectedCar.brand} ${selectedCar.model} (${selectedCar.year})`;

    const tagEl = document.getElementById('modal-tag');
    if (tagEl) tagEl.textContent = selectedCar.category;

    const isVente = currentMode === 'vente';
    const priceEl = document.getElementById('modal-price');
    if (priceEl) {
        priceEl.textContent = isVente 
            ? `${selectedCar.priceVente} FCFA` 
            : `${selectedCar.priceLocation} FCFA / jour`;
    }

    const fuelEl = document.getElementById('spec-fuel');
    if (fuelEl) fuelEl.textContent = selectedCar.fuel;

    const transEl = document.getElementById('spec-trans');
    if (transEl) transEl.textContent = selectedCar.transmission;

    const yearEl = document.getElementById('spec-year');
    if (yearEl) yearEl.textContent = selectedCar.year;

    const kmEl = document.getElementById('spec-km');
    if (kmEl) kmEl.textContent = selectedCar.km;

    const mainImg = document.getElementById('modal-main-img');
    if (mainImg && selectedCar.images && selectedCar.images.length > 0) {
        mainImg.src = selectedCar.images[0];
    }

    const thumbnailsContainer = document.getElementById('modal-thumbnails');
    if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = '';

        if (selectedCar.images && selectedCar.images.length > 0) {
            selectedCar.images.forEach((imgSrc, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgSrc;
                thumb.className = `w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${index === 0 ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`;
                
                thumb.onclick = () => {
                    if (mainImg) mainImg.src = imgSrc;
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
// 7. ENVOI WHATSAPP
// ==========================================
function sendWhatsAppOrder(e) {
    e.preventDefault();
    if (!selectedCar) return;

    const clientNameInput = document.getElementById('client-name');
    const clientName = clientNameInput ? clientNameInput.value : 'Client';
    const phoneNumber = "2250142654427"; 

    const typeMsg = currentMode === 'vente' ? 'l\'ACHAT' : 'la LOCATION';
    const priceMsg = currentMode === 'vente' ? `${selectedCar.priceVente} FCFA` : `${selectedCar.priceLocation} FCFA / jour`;

    const message = `Bonjour Auto Express, je suis *${clientName}*.\n\nJe suis intéressé(e) par *${typeMsg}* du véhicule suivant :\n🚘 *${selectedCar.brand} ${selectedCar.model} (${selectedCar.year})*\n💰 Prix : ${priceMsg}\n\nMerci de me recontacter pour finaliser la procédure.`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}