new Vue({
    el: '#app',
    data: {
        visible: false,
        currentDealership: null,
        dealerships: [],
        vehicles: [],
        usedListings: [],
        auctions: [],
        activeTab: 'showroom',
        tabs: [
            { id: 'showroom', label: 'Showroom' },
            { id: 'used', label: 'Použité' },
            { id: 'auctions', label: 'Aukce' },
            { id: 'admin', label: 'Admin' }
        ],
        newDealership: {
            name: '',
            owned: false,
            pedModel: 's_m_m_car_salesman',
            pedScenario: 'WORLD_HUMAN_STAND_IMPATIENT',
            categories: '',
            accentColor: '#B57EDC'
        },
        bidAmount: {}
    },
    computed: {
        filteredVehicles() {
            if (!this.currentDealership || !this.currentDealership.categories) return this.vehicles;
            let cats = JSON.parse(this.currentDealership.categories);
            if (cats.includes('all')) return this.vehicles;
            return this.vehicles.filter(v => cats.includes(v.category));
        }
    },
    methods: {
        open(data) {
            this.visible = true;
            this.activeTab = 'showroom';
            this.loadDealerships();
            this.loadVehicles();
            this.loadUsed();
            this.loadAuctions();
        },
        openAdmin() {
            this.visible = true;
            this.activeTab = 'admin';
        },
        closeUI() {
            this.visible = false;
            fetch(`https://${GetParentResourceName()}/close`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
        },
        loadDealerships() {
            // Zmenené na POST, prázdne body je vo FiveM pre stabilitu povinné
            fetch(`https://${GetParentResourceName()}/getDealerships`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) 
            })
            .then(resp => resp.json())
            .then(data => {
                this.dealerships = data;
                if (this.dealerships.length > 0) this.currentDealership = this.dealerships[0];
            }).catch(err => console.error("Chyba načítania dealershipov:", err));
        },
        loadVehicles() {
            fetch(`https://${GetParentResourceName()}/getVehicleList`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) 
            })
            .then(resp => resp.json())
            .then(data => this.vehicles = data)
            .catch(err => console.error("Chyba načítania vozidiel:", err));
        },
        loadUsed() {
            fetch(`https://${GetParentResourceName()}/getUsedVehicles`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) 
            })
            .then(resp => resp.json())
            .then(data => this.usedListings = data)
            .catch(err => console.error("Chyba načítania ojazdených áut:", err));
        },
        loadAuctions() {
            fetch(`https://${GetParentResourceName()}/getAuctions`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) 
            })
            .then(resp => resp.json())
            .then(data => this.auctions = data)
            .catch(err => console.error("Chyba načítania aukcií:", err));
        },
        buyVehicle(vehicle) {
            fetch(`https://${GetParentResourceName()}/buyVehicle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dealershipId: this.currentDealership.id,
                    model: vehicle.model,
                    color: {},
                    finance: false
                })
            });
        },
        reserveVehicle(vehicle) {
            fetch(`https://${GetParentResourceName()}/reserveVehicle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dealershipId: this.currentDealership.id, model: vehicle.model })
            });
        },
        buyUsed(listing) {
            // tu môžete dopísať logiku neskôr
        },
        bidAuction(auctionId) {
            let amount = this.bidAmount[auctionId];
            if (amount) {
                fetch(`https://${GetParentResourceName()}/bidAuction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ auctionId: auctionId, amount: amount })
                });
            }
        },
        createDealership() {
            fetch(`https://${GetParentResourceName()}/createDealership`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.newDealership)
            }).then(() => this.closeUI());
        }
    },
    mounted() {
        window.addEventListener('message', (event) => {
            if (event.data.action === 'open') {
                this.open(event.data);
            } else if (event.data.action === 'openAdmin') {
                this.openAdmin();
            }
        });
    }
});