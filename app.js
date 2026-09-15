// ==========================================
// 1. BASE DE DONNÉES PAR DÉFAUT & ÉTAT GLOBAL
// ==========================================
const defaultCars = [
    {
        id: 'kia-sportage-2022',
        createdAt: 1000,
        brand: 'Kia',
        model: 'Sportage',
        year: '2022',
        category: 'SUV',
        fuel: 'Essence',
        cylinders: '4 Cylindres',
        transmission: 'Automatique',
        km: '25 000 km',
        start: 'Bouton Start/Stop',
        ac: 'Origine',
        imported: 'Immatriculé',
        papers: 'À jour',
        priceVente: '13 500 000',
        priceLocation: '45 000',
        offerType: 'vente',
        rentalStatus: 'available', // 'available' ou 'booked'
        images: [
            'images/kia-sportage/1.jpg',
            'images/kia-sportage/2.jpg',
            'images/kia-sportage/3.jpg'
        ]
    },
    {
        id: 'jeep-sahara-2024',
        createdAt: 2000,
        brand: 'Jeep',
        model: 'Wrangler Sahara',
        year: '2024',
        category: 'SUV',
        fuel: 'Hybride',
        cylinders: 'V6',
        transmission: 'Automatique',
        km: '5 000 km',
        start: 'Bouton Start/Stop',
        ac: 'Origine',
        imported: 'Immatriculé',
        papers: 'À jour',
        priceVente: '45 000 000',
        priceLocation: '100 000',
        offerType: 'vente',
        rentalStatus: 'booked', // En location / Réservé
        images: [
            'images/jeep-sahara/1.jpg',
            'images/jeep-sahara/2.jpg'
        ]
    },
    {
        id: 'mazda-cx5-2025',
        createdAt: 3000,
        brand: 'Mazda',
        model: 'CX-5',
        year: '2025',
        category: 'SUV',
        fuel: 'Essence',
        cylinders: '4 Cylindres',
        transmission: 'Automatique',
        km: '16 761 km',
        start: 'Bouton Start/Stop',
        ac: 'Origine',
        imported: 'Immatriculé',
        papers: 'À jour',
        priceVente: '22 000 000',
        priceLocation: '60 000',
        offerType: 'vente',
        rentalStatus: 'available',
        images: [
            'images/mazda-cx5/1.jpg',
            'images/mazda-cx5/2.jpg'
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

    allCars.sort((a, b) => {
        const timeA = a.createdAt || parseInt(a.id.replace('car-', '')) || 0;
        const timeB = b.createdAt || parseInt(b.id.replace('car-', '')) || 0;
        return timeB - timeA;
    });

    applyFilters();
}

// ==========================================
// 3. AFFICHAGE DES CARTES DE VÉHICULES
// ==========================================
function renderCars(carList) {
    const grid = document.getElementById('car-grid');
    if (!grid) return;

    grid.innerHTML = '';

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
        const priceDisplay = isVente ? `${car.priceVente} FCFA` : `${car.priceLocation} FCFA / jour`;
        const priceLabel = isVente ? 'PRIX COMPTANT' : 'PRIX LOCATION';
        const photoCount = car.images ? car.images.length : 0;
        const mainImg = (car.images && car.images.length > 0) ? car.images[0] : '';

        const fuelText = car.fuel || 'Essence';
        const cylText = car.cylinders ? ` (${car.cylinders})` : '';
        const engineDisplay = `${fuelText}${cylText}`;

        // Badge dynamique ultra-compact pour ne pas masquer l'image
        let availabilityBadge = '';
        if (!isVente) {
            const isBooked = car.rentalStatus === 'booked';
            const badgeClass = isBooked ? 'bg-amber-500 text-black border-amber-400' : 'bg-emerald-500 text-black border-emerald-400';
            const badgeText = isBooked ? '🟡 Loué / Réservé' : '🟢 Disponible';
            availabilityBadge = `<span class="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider border uppercase w-fit ${badgeClass}">${badgeText}</span>`;
        }

        const carCard = document.createElement('div');
        carCard.className = 'bg-[#131924] border border-white/10 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-white/20 transition-all';

        carCard.innerHTML = `
            <div>
                <div class="relative rounded-xl overflow-hidden mb-4 h-56 bg-[#0c1017]">
                    <img src="${mainImg}" class="absolute inset-0 w-full h-full object-cover blur-lg opacity-35 scale-110" alt="">
                    <img src="${mainImg}" alt="${car.brand} ${car.model}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    
                    <!-- Conteneur unifié en haut à gauche pour éviter tout chevauchement -->
                    <div class="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                        <span class="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest text-white uppercase w-fit">
                            ${car.category}
                        </span>
                        ${availabilityBadge}
                    </div>

                    <span class="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-medium tracking-wider text-white/80 uppercase flex items-center gap-1.5">
                        📷 ${photoCount} PHOTOS
                    </span>
                </div>

                <h3 class="text-white font-bold text-lg mb-3">
                    ${car.brand} ${car.model} <span class="text-white/40 font-normal text-sm">(${car.year || 'N/A'})</span>
                </h3>

                <div class="grid grid-cols-3 gap-2 bg-[#0b0f17] p-3 rounded-xl border border-white/5 mb-4 text-center">
                    <div>
                        <div class="text-[9px] uppercase tracking-wider text-white/40 mb-0.5">Moteur</div>
                        <div class="text-xs font-semibold text-white truncate px-1" title="${engineDisplay}">${engineDisplay}</div>
                    </div>
                    <div class="border-x border-white/5">
                        <div class="text-[9px] uppercase tracking-wider text-white/40 mb-0.5">Boîte</div>
                        <div class="text-xs font-semibold text-white">${car.transmission || 'Automatique'}</div>
                    </div>
                    <div>
                        <div class="text-[9px] uppercase tracking-wider text-white/40 mb-0.5">Année</div>
                        <div class="text-xs font-semibold text-white">${car.year || 'N/A'}</div>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                <div>
                    <span class="text-[9px] uppercase tracking-wider text-white/40 block">${priceLabel}</span>
                    <span class="text-base font-extrabold text-white tracking-tight">${priceDisplay}</span>
                </div>

                <button onclick="openModal('${car.id}')" class="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
                    VOIR LA FICHE
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

    const rentalDatesContainer = document.getElementById('rental-dates-container');
    if (rentalDatesContainer) {
        if (!isVente) {
            rentalDatesContainer.classList.remove('hidden');
        } else {
            rentalDatesContainer.classList.add('hidden');
        }
    }

    const startVal = selectedCar.startType || selectedCar.start || 'Bouton Start/Stop';
    const acVal = selectedCar.airConditioning || selectedCar.ac || 'Origine';
    const importedVal = selectedCar.isImported || selectedCar.imported || 'Immatriculé';
    const papersVal = selectedCar.papersOk || selectedCar.papers || 'À jour';

    const engineFullDisplay = selectedCar.cylinders 
        ? `${selectedCar.fuel || 'Essence'} - ${selectedCar.cylinders}` 
        : (selectedCar.fuel || 'Essence');

    if (document.getElementById('spec-fuel')) document.getElementById('spec-fuel').textContent = engineFullDisplay;
    if (document.getElementById('spec-trans')) document.getElementById('spec-trans').textContent = selectedCar.transmission || 'Automatique';
    if (document.getElementById('spec-year')) document.getElementById('spec-year').textContent = selectedCar.year || 'N/A';
    if (document.getElementById('spec-km')) document.getElementById('spec-km').textContent = selectedCar.km || 'N/A';
    if (document.getElementById('spec-start')) document.getElementById('spec-start').textContent = startVal;
    if (document.getElementById('spec-ac')) document.getElementById('spec-ac').textContent = acVal;
    if (document.getElementById('spec-imported')) document.getElementById('spec-imported').textContent = importedVal;
    if (document.getElementById('spec-papers')) document.getElementById('spec-papers').textContent = papersVal;

    const mainImg = document.getElementById('modal-main-img');
    if (selectedCar.images && selectedCar.images.length > 0) {
        mainImg.src = selectedCar.images[0];
    }

    const thumbnailsContainer = document.getElementById('modal-thumbnails');
    if (thumbnailsContainer) {
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
        const matchesFuel = (fuelVal === 'all') || (car.fuel === fuelVal);

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

    const isVente = currentMode === 'vente';
    const typeMsg = isVente ? 'l\'ACHAT' : 'la LOCATION';
    const priceMsg = isVente ? `${selectedCar.priceVente} FCFA` : `${selectedCar.priceLocation} FCFA / jour`;

    let message = `Bonjour Auto Express, je suis *${clientName}*.\n\nJe suis intéressé(e) par *${typeMsg}* du véhicule suivant :\n🚘 *${selectedCar.brand} ${selectedCar.model} (${selectedCar.year})*\n💰 Prix : ${priceMsg}`;

    if (!isVente) {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (startDate && endDate) {
            message += `\n📅 Période souhaitée : du *${startDate}* au *${endDate}*`;
        } else {
            message += `\n📅 Période souhaitée : À définir avec vous`;
        }
    }

    message += `\n\nMerci de me recontacter pour finaliser la procédure.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
};