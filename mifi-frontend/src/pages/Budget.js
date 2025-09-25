import { useState, useEffect } from 'react';
import { 
    CalendarIcon, 
    CurrencyDollarIcon,
    BanknotesIcon,
    ChartBarIcon,
    TableCellsIcon,
    CalculatorIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

export const Budget = () => {
    const [currentDate] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    
    // Szablon planera przelewów (jak w Excelu)
    const DEFAULT_TRANSFER_ITEMS = [
        // Przychody
        { name: 'Przychód - pensja', type: 'income', defaultAmount: 7000, description: 'Pensja podstawowa', bank: 'PKO SA' },
        { name: 'Hipoteka (opłaty)', type: 'expense', defaultAmount: 2800, description: 'Rata kredytu hipotecznego', bank: 'PKO SA', isBudgetable: false },
        { name: 'Opłaty', type: 'expense', defaultAmount: 1400, description: 'Media, czynsz, internet', bank: 'Santander', isBudgetable: false },
        { name: 'Oszczędzanie', type: 'expense', defaultAmount: 1000, description: 'Wpłacone na dobry zysk', bank: 'PKO SA', isBudgetable: false },
        { name: 'Wydatki nieregularne', type: 'expense', defaultAmount: 1500, description: 'Nieprzewidziane wydatki', bank: 'PKO SA', isBudgetable: true },
        { name: 'Życie', type: 'expense', defaultAmount: 4500, description: 'Codzienne wydatki', bank: 'mbank', isBudgetable: true },
        { name: 'Wypłata dla nas', type: 'expense', defaultAmount: 2000, description: 'Kieszonkowe, wydatki osobiste', bank: 'Pko bp/santander tomek', isBudgetable: true },
        { name: 'AI', type: 'expense', defaultAmount: 180, description: 'Subskrypcje AI, automatyzacja', bank: 'Automat', isBudgetable: false },
        
        // Dodatkowe pozycje
        { name: 'Iphone', type: 'expense', defaultAmount: 250, description: 'Rata za telefon', bank: 'CA apka', isBudgetable: false },
        { name: 'Lodówka + pralka', type: 'expense', defaultAmount: 315, description: 'Raty za sprzęt AGD', bank: 'Alior bank apka', isBudgetable: false },
        { name: 'Spotify', type: 'expense', defaultAmount: 31, description: 'Subskrypcja muzyki', bank: 'mbank automat', isBudgetable: false }
    ];
    
    // Predefiniowane kategorie budżetowe (z Analytics/colors)
    const DEFAULT_BUDGET_CATEGORIES = [
        { name: 'GROCERIES', description: 'Zakupy spożywcze' },
        { name: 'ZABKA', description: 'Convenience store' },
        { name: 'PHARMACY', description: 'Apteka, leki' },
        { name: 'FUEL', description: 'Paliwo' },
        { name: 'PARKING_TOLLS', description: 'Parkowanie, opłaty drogowe' },
        { name: 'TRANSPORT_RIDEHAIL', description: 'Uber, Bolt, taxi' },
        { name: 'FAST_FOOD', description: 'Fast food, quick meals' },
        { name: 'RESTAURANT', description: 'Restauracje' },
        { name: 'CAFE', description: 'Kawiarnie' },
        { name: 'DESSERTS', description: 'Słodycze, desery' },
        { name: 'ENTERTAINMENT', description: 'Rozrywka, kino' },
        { name: 'GIFTS', description: 'Prezenty' },
        { name: 'HOME_GOODS', description: 'Rzeczy do domu' },
        { name: 'BEAUTY_PERSONAL_CARE', description: 'Kosmetyki, higiena' },
        { name: 'GOVERNMENT_FEES', description: 'Opłaty urzędowe' },
        { name: 'FITNESS_WELLNESS', description: 'Siłownia, wellness' },
        { name: 'ONLINE_SERVICES', description: 'Usługi online' },
        { name: 'TRANSFER', description: 'Przelewy, transfery' }
    ];
    
    // Stany dla zakładek
    const [activeTab, setActiveTab] = useState('transfers'); // 'transfers' lub 'budget'
    
    // Stany dla formularzy
    const [showBudgetForm, setShowBudgetForm] = useState(false);
    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showNewIncomeForm, setShowNewIncomeForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [editingIncome, setEditingIncome] = useState(null);
    
    // Dane budżetu - używamy struktury z kategoriami i źródłami
    const [monthlyBudgetCategories, setMonthlyBudgetCategories] = useState({});
    
    // Kategorie z API
    const [availableCategories, setAvailableCategories] = useState([]);
    
    // Uproszczone dane planera przelewów
    const [monthlyIncomes, setMonthlyIncomes] = useState({
        myIncome: 0,
        spouseIncome: 0
    });
    const [monthlyTransfers, setMonthlyTransfers] = useState({});
    const [customTransferItems, setCustomTransferItems] = useState([]);
    const [subBudgets, setSubBudgets] = useState({}); // Pod-budżety dla kategorii
    
    // Formularz budżetu
    const [budgetForm, setBudgetForm] = useState({
        category: '',
        plannedAmount: '',
        description: '',
        usePredefined: false
    });
    
    // Formularz przychodu
    const [incomeForm, setIncomeForm] = useState({
        source: '',
        amount: '',
        frequency: 'monthly',
        description: ''
    });
    
    // Formularz nowej pozycji transferu
    const [showNewTransferForm, setShowNewTransferForm] = useState(false);
    const [newTransferForm, setNewTransferForm] = useState({
        name: '',
        bank: '',
        description: '',
        defaultAmount: 0
    });
    
    // Formularz nowej kategorii
    const [newCategoryForm, setNewCategoryForm] = useState({
        name: '',
        description: ''
    });
    
    // Formularz nowego przychodu
    const [newIncomeForm, setNewIncomeForm] = useState({
        source: '',
        amount: '',
        description: ''
    });
    
    // Stany dla zapisywania
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    
    // Stany dla domyślnego szablonu
    const [hasBudgetInDB, setHasBudgetInDB] = useState(false);
    const [isLoadingDefault, setIsLoadingDefault] = useState(false);
    const [isUpdatingDefault, setIsUpdatingDefault] = useState(false);
    
    // Ładowanie danych z API per miesiąc
    useEffect(() => {
        const loadMonthlyData = async () => {
            try {
                // Format selectedMonth to YYYY-MM for API call
                const response = await fetch(`http://localhost:8080/budget/monthly/${selectedMonth}`);
                
                if (response.ok) {
                    const budgetData = await response.json();
                    // Convert backend data to frontend format
                    convertBackendDataToFrontend(budgetData);
                    setHasBudgetInDB(true);
                } else if (response.status === 404) {
                    // No budget found for this month, show empty view
                    setEmptyView();
                    setHasBudgetInDB(false);
                } else {
                    console.error('Error loading budget data:', response.statusText);
                    setEmptyView();
                    setHasBudgetInDB(false);
                }
            } catch (error) {
                console.error('Error fetching budget data:', error);
                setEmptyView();
                setHasBudgetInDB(false);
            }
        };
        
        loadMonthlyData();
    }, [selectedMonth]); // Przeładuj dane gdy zmieni się miesiąc
    
    // Ładowanie kategorii z API
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetch('http://localhost:8080/budget/categories/all');
                if (response.ok) {
                    const categories = await response.json();
                    setAvailableCategories(categories);
                } else {
                    console.error('Error loading categories:', response.statusText);
                    // Fallback to default categories if API fails
                    setAvailableCategories(DEFAULT_BUDGET_CATEGORIES);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Fallback to default categories if API fails
                setAvailableCategories(DEFAULT_BUDGET_CATEGORIES);
            }
        };
        
        loadCategories();
    }, []); // Load once on component mount
    
    // Helper function to convert backend data to frontend format
    const convertBackendDataToFrontend = (budgetData) => {
        // Convert incomes
        const myIncome = budgetData.incomes?.find(inc => inc.source === "Salary Tomek")?.amount || 0;
        const spouseIncome = budgetData.incomes?.find(inc => inc.source === "Salary Ania")?.amount || 0;
        setMonthlyIncomes({ myIncome, spouseIncome });
        
        // Convert fixed expenses to transfers - this will be used for calculations
        const transfers = {};
        budgetData.fixedExpenses?.forEach(expense => {
            // Map expense descriptions to transfer names (you may need to adjust this mapping)
            const transferName = getTransferNameFromDescription(expense.description);
            transfers[transferName] = expense.amount;
        });
        
        // Also populate with default transfer items that might not be in fixedExpenses
        DEFAULT_TRANSFER_ITEMS.forEach(item => {
            if (item.type === 'expense' && !transfers[item.name]) {
                transfers[item.name] = item.defaultAmount;
            }
        });
        
        setMonthlyTransfers(transfers);
        
        // Convert envelopes to budget categories
        const budgetCategories = {};
        budgetData.envelopes?.forEach(envelope => {
            const categoryName = getCategoryNameFromId(envelope.categoryId);
            if (categoryName) {
                budgetCategories[categoryName] = {
                    amount: envelope.limit,
                    source: 'Życie', // Default source
                    description: DEFAULT_BUDGET_CATEGORIES.find(cat => cat.name === categoryName)?.description || ''
                };
            }
        });
        setMonthlyBudgetCategories(budgetCategories);
        
        // Set empty arrays for custom items and sub-budgets (not in backend yet)
        setCustomTransferItems([]);
        setSubBudgets({});
    };
    
    // Helper function to set empty view when no budget exists
    const setEmptyView = () => {
        setMonthlyIncomes({ myIncome: 0, spouseIncome: 0 });
        setMonthlyTransfers({});
        setMonthlyBudgetCategories({});
        setCustomTransferItems([]);
        setSubBudgets({});
    };
    
    // Helper function to set default values when no budget exists
    const setDefaultValues = () => {
        setMonthlyIncomes({ myIncome: 0, spouseIncome: 0 });
        
        // Initialize with default transfer values
        const defaultTransfers = {};
        DEFAULT_TRANSFER_ITEMS.forEach(item => {
            if (item.type === 'expense') {
                defaultTransfers[item.name] = item.defaultAmount;
            }
        });
        setMonthlyTransfers(defaultTransfers);
        
        // Initialize with available categories from API
        const defaultCategories = {};
        availableCategories.forEach(category => {
            defaultCategories[category.name] = {
                amount: 0,
                source: 'Życie',
                description: category.description
            };
        });
        setMonthlyBudgetCategories(defaultCategories);
        
        setCustomTransferItems([]);
        setSubBudgets({});
    };
    
    // Helper function to map expense descriptions to transfer names
    const getTransferNameFromDescription = (description) => {
        // This mapping might need adjustment based on your actual data
        const mapping = {
            'Rata kredytu hipotecznego': 'Hipoteka (opłaty)',
            'Media, czynsz, internet': 'Opłaty',
            'Wpłacone na dobry zysk': 'Oszczędzanie',
            'Nieprzewidziane wydatki': 'Wydatki nieregularne',
            'Codzienne wydatki': 'Życie',
            'Kieszonkowe, wydatki osobiste': 'Wypłata dla nas',
            'Subskrypcje AI, automatyzacja': 'AI',
            'Rata za telefon': 'Iphone',
            'Raty za sprzęt AGD': 'Lodówka + pralka',
            'Subskrypcja muzyki': 'Spotify'
        };
        return mapping[description] || description;
    };
    
    // Helper function to map category IDs to names from API
    const getCategoryNameFromId = (categoryId) => {
        const category = availableCategories.find(cat => cat.id === categoryId);
        return category ? category.name : null;
    };
    
    // State update functions (no localStorage)
    const saveMonthlyBudgetCategories = (newCategories) => {
        setMonthlyBudgetCategories(newCategories);
    };
    
    const saveMonthlyIncomes = (newIncomes) => {
        setMonthlyIncomes(newIncomes);
    };
    
    const saveMonthlyTransfers = (newTransfers) => {
        setMonthlyTransfers(newTransfers);
    };
    
    const saveCustomTransferItems = (newItems) => {
        setCustomTransferItems(newItems);
    };
    
    const saveSubBudgets = (newSubBudgets) => {
        setSubBudgets(newSubBudgets);
    };
    
    // Funkcja tworzenia nowego envelope
    const handleCreateEnvelope = (e) => {
        e.preventDefault();
        
        // Dodaj nowy envelope do monthlyBudgetCategories
        const newCategories = { ...monthlyBudgetCategories };
        newCategories[newCategoryForm.name] = {
            amount: parseFloat(newCategoryForm.description) || 0,
            source: 'Życie', // Domyślne źródło
            description: availableCategories.find(cat => cat.name === newCategoryForm.name)?.description || ''
        };
        
        saveMonthlyBudgetCategories(newCategories);
        
        // Reset form
        setNewCategoryForm({ name: '', description: '' });
        setShowCategoryForm(false);
        
        setSaveMessage('Envelope added successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    };
    
    // Funkcja obsługi formularza nowego przychodu
    const handleNewIncomeSubmit = (e) => {
        e.preventDefault();
        
        // Dodaj nowy przychód do monthlyIncomes
        const newIncomes = { ...monthlyIncomes };
        
        // Sprawdź czy to jest "Mój przychód" czy "Przychód Ani" czy nowy
        if (newIncomeForm.source === "Salary Tomek" || newIncomeForm.source === "Mój przychód") {
            newIncomes.myIncome = parseFloat(newIncomeForm.amount) || 0;
        } else if (newIncomeForm.source === "Salary Ania" || newIncomeForm.source === "Przychód Ani") {
            newIncomes.spouseIncome = parseFloat(newIncomeForm.amount) || 0;
        } else {
            // Dla nowych źródeł przychodu, dodaj do myIncome (można to rozszerzyć)
            newIncomes.myIncome = (newIncomes.myIncome || 0) + (parseFloat(newIncomeForm.amount) || 0);
        }
        
        saveMonthlyIncomes(newIncomes);
        
        // Reset form
        setNewIncomeForm({ source: '', amount: '', description: '' });
        setShowNewIncomeForm(false);
        
        setSaveMessage('Income added successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    };
    
    // Funkcja zapisywania budżetu na dany miesiąc
    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        
        try {
            // Przygotuj dane dla backend API zgodnie z CreateBudgetCommand
            const backendBudgetData = prepareBudgetForBackend();
            
            // Zapisz do backend
            const response = await fetch('http://localhost:8080/budget', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(backendBudgetData)
            });
            
            if (!response.ok) {
                throw new Error(`Backend error: ${response.status} ${response.statusText}`);
            }
            
            setSaveMessage('Budget saved successfully!');
            
            // Ukryj wiadomość po 3 sekundach
            setTimeout(() => setSaveMessage(''), 3000);
            
        } catch (error) {
            console.error('Error saving budget:', error);
            setSaveMessage(`Error saving budget: ${error.message}`);
            setTimeout(() => setSaveMessage(''), 3000);
        } finally {
            setIsSaving(false);
        }
    };
    
    // Funkcja przygotowująca dane dla backend API
    const prepareBudgetForBackend = () => {
        const [year, month] = selectedMonth.split('-');
        const budgetTitle = `${formatMonthDisplay(selectedMonth)} Budget`;
        
        // Calculate start and end dates for the selected month
        const startDate = `${year}-${month}-01`; // First day of the month
        
        // Calculate last day of the month
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`; // Last day of the month
        
        // Przygotuj incomes - konwertuj z monthlyIncomes
        const incomes = [];
        if (monthlyIncomes.myIncome > 0) {
            incomes.push({
                amount: monthlyIncomes.myIncome,
                source: "Salary Tomek"
            });
        }
        if (monthlyIncomes.spouseIncome > 0) {
            incomes.push({
                amount: monthlyIncomes.spouseIncome,
                source: "Salary Ania"
            });
        }
        
        // Przygotuj fixed expenses - konwertuj z monthlyTransfers (wszystkie wydatki)
        const fixedExpenses = [];
        allTransferItems.forEach(item => {
            if (monthlyTransfers[item.name] > 0) {
                fixedExpenses.push({
                    amount: monthlyTransfers[item.name],
                    description: item.description || item.name,
                    dueDate: `${year}-${month}-05` // Domyślnie 5 dzień miesiąca
                });
            }
        });
        
        // Przygotuj envelopes - konwertuj z monthlyBudgetCategories
        const envelopes = new Set();
        Object.entries(monthlyBudgetCategories).forEach(([categoryName, categoryData]) => {
            if (categoryData.amount > 0) {
                // Mapuj nazwy kategorii na categoryId - potrzebujesz mapowania w backend
                const categoryId = getCategoryIdFromName(categoryName);
                if (categoryId) {
                    envelopes.add({
                        categoryId: categoryId,
                        limit: categoryData.amount
                    });
                }
            }
        });
        
        return {
            title: budgetTitle,
            type: "MONTHLY",
            start: startDate,
            end: endDate,
            incomes: incomes,
            fixedExpenses: fixedExpenses,
            envelopes: Array.from(envelopes)
        };
    };
    
    // Funkcja mapująca nazwy kategorii na ID z API
    const getCategoryIdFromName = (categoryName) => {
        const category = availableCategories.find(cat => cat.name === categoryName);
        return category ? category.id : null;
    };
    
    // Funkcja ładowania domyślnego szablonu
    const handleLoadDefaultTemplate = async () => {
        setIsLoadingDefault(true);
        setSaveMessage('');
        
        try {
            const response = await fetch('http://localhost:8080/budget/default');
            
            if (response.ok) {
                const defaultBudgetData = await response.json();
                // Convert default template to frontend format
                convertBackendDataToFrontend(defaultBudgetData);
                setHasBudgetInDB(true);
                setSaveMessage('Default template loaded successfully!');
                setTimeout(() => setSaveMessage(''), 3000);
            } else {
                throw new Error(`Failed to load default template: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error loading default template:', error);
            setSaveMessage(`Error loading default template: ${error.message}`);
            setTimeout(() => setSaveMessage(''), 3000);
        } finally {
            setIsLoadingDefault(false);
        }
    };
    
    // Funkcja aktualizacji domyślnego szablonu
    const handleUpdateDefaultTemplate = async () => {
        setIsUpdatingDefault(true);
        setSaveMessage('');
        
        try {
            // Przygotuj dane dla backend API zgodnie z CreateBudgetCommand
            const backendBudgetData = prepareBudgetForBackend();
            
            // Zapisz jako domyślny szablon
            const response = await fetch('http://localhost:8080/budget/default', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(backendBudgetData)
            });
            
            if (!response.ok) {
                throw new Error(`Backend error: ${response.status} ${response.statusText}`);
            }
            
            setSaveMessage('Default template updated successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
            
        } catch (error) {
            console.error('Error updating default template:', error);
            setSaveMessage(`Error updating default template: ${error.message}`);
            setTimeout(() => setSaveMessage(''), 3000);
        } finally {
            setIsUpdatingDefault(false);
        }
    };
    

    
    // Obsługa formularza nowej pozycji transferu
    const handleNewTransferSubmit = (e) => {
        e.preventDefault();
        
        const newItem = {
            id: Date.now(),
            name: newTransferForm.name,
            bank: newTransferForm.bank,
            description: newTransferForm.description,
            defaultAmount: parseFloat(newTransferForm.defaultAmount) || 0,
            type: 'expense',
            isCustom: true
        };
        
        const newCustomItems = [...customTransferItems, newItem];
        saveCustomTransferItems(newCustomItems);
        
        // Dodaj także do monthlyTransfers z domyślną wartością
        const newTransfers = {
            ...monthlyTransfers,
            [newItem.name]: newItem.defaultAmount
        };
        saveMonthlyTransfers(newTransfers);
        
        resetNewTransferForm();
    };
    
    const resetNewTransferForm = () => {
        setNewTransferForm({
            name: '',
            bank: '',
            description: '',
            defaultAmount: 0
        });
        setShowNewTransferForm(false);
    };
    
    // Usuwanie pozycji transferu
    const handleDeleteTransferItem = (itemName, isCustom) => {
        if (window.confirm('Czy na pewno chcesz usunąć tę pozycję?')) {
            if (isCustom) {
                // Usuń z customTransferItems
                const newCustomItems = customTransferItems.filter(item => item.name !== itemName);
                saveCustomTransferItems(newCustomItems);
            }
            
            // Usuń z monthlyTransfers
            const newTransfers = { ...monthlyTransfers };
            delete newTransfers[itemName];
            saveMonthlyTransfers(newTransfers);
        }
    };
    

    

    
    // Łączenie domyślnych i custom pozycji transferu
    const allTransferItems = [
        ...DEFAULT_TRANSFER_ITEMS.filter(item => item.type === 'expense'),
        ...customTransferItems
    ];
    
    // Obliczenia dla planera przelewów
    const totalIncome = monthlyIncomes.myIncome + monthlyIncomes.spouseIncome;
    
    // Sumuj wszystkie wydatki (teraz wszystkie są fixedExpenses)
    const totalTransferExpenses = allTransferItems
        .reduce((sum, item) => sum + (monthlyTransfers[item.name] || 0), 0);
    
    const remainingAfterTransfers = totalIncome - totalTransferExpenses;
    
    // Kategorie dostępne do budżetowania
    const budgetableCategories = allTransferItems.filter(item => item.isBudgetable);
    const budgetableAmounts = budgetableCategories.reduce((acc, item) => {
        acc[item.name] = monthlyTransfers[item.name] || item.defaultAmount || 0;
        return acc;
    }, {});
    
    // Dodaj "Pozostałe" jako kategorię do budżetowania
    budgetableAmounts['Pozostałe'] = remainingAfterTransfers;
    
    // Oblicz łączną kwotę dostępną do budżetowania
    const totalBudgetableAmount = Object.values(budgetableAmounts).reduce((sum, amount) => sum + amount, 0);
    
    // Dostępne źródła budżetu (tylko 3 główne)
    const availableBudgetSources = ['Życie', 'Wydatki nieregularne', 'Pozostałe'];
    
    // Oblicz ile jest wykorzystane z każdego źródła
    const usedFromSources = availableBudgetSources.reduce((acc, source) => {
        acc[source] = Object.values(monthlyBudgetCategories).reduce((sum, category) => {
            if (category.source === source) {
                return sum + (category.amount || 0);
            }
            return sum;
        }, 0);
        return acc;
    }, {});
    
    // Łączna kwota zabudżetowana
    const totalBudgetedAmount = Object.values(monthlyBudgetCategories).reduce((sum, category) => sum + (category.amount || 0), 0);
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };
    
    const formatMonthDisplay = (monthKey) => {
        const [year, month] = monthKey.split('-').map(Number);
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Budżetowanie</h1>
                            <p className="text-gray-600">Zarządzaj swoim budżetem miesięcznym i planowaniem przelewów</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            {saveMessage && (
                                <span className={`text-sm px-3 py-1 rounded-full ${
                                    saveMessage.includes('Error') 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {saveMessage}
                                </span>
                            )}
                            
                            {/* Buttons for default template functionality */}
                            {!hasBudgetInDB && (
                                <button
                                    onClick={handleLoadDefaultTemplate}
                                    disabled={isLoadingDefault}
                                    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                                        isLoadingDefault
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    {isLoadingDefault ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <PlusIcon className="h-5 w-5 mr-2" />
                                            Use Default Template
                                        </>
                                    )}
                                </button>
                            )}
                            
                            <button
                                onClick={handleUpdateDefaultTemplate}
                                disabled={isUpdatingDefault}
                                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                                    isUpdatingDefault
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                            >
                                {isUpdatingDefault ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <PencilIcon className="h-5 w-5 mr-2" />
                                        Update Default
                                    </>
                                )}
                            </button>
                            
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                                    isSaving
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                                        Save Budget
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selektor miesiąca */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <CalendarIcon className="h-6 w-6 text-gray-500" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                {formatMonthDisplay(selectedMonth)}
                            </h2>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {Array.from({ length: 12 }, (_, i) => {
                                    const year = currentDate.getFullYear();
                                    const month = String(i + 1).padStart(2, '0');
                                    const monthKey = `${year}-${month}`;
                                    return (
                                        <option key={monthKey} value={monthKey}>
                                            {formatMonthDisplay(monthKey)}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Zakładki */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('transfers')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'transfers'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <TableCellsIcon className="h-5 w-5" />
                                    <span>Planer przelewów</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('budget')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'budget'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <CalculatorIcon className="h-5 w-5" />
                                    <span>Budżet wydatków</span>
                                </div>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* No budget view */}
                {!hasBudgetInDB && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <CalendarIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No budget found for {formatMonthDisplay(selectedMonth)}</h3>
                        <p className="text-gray-500 mb-6">
                            This month doesn't have a budget yet. You can start with a default template or create a new one from scratch.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleLoadDefaultTemplate}
                                disabled={isLoadingDefault}
                                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                                    isLoadingDefault
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                                {isLoadingDefault ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Use Default Template
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setHasBudgetInDB(true);
                                    setEmptyView();
                                }}
                                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <PencilIcon className="h-5 w-5 mr-2" />
                                Create New Budget
                            </button>
                        </div>
                    </div>
                )}

                {/* Zawartość zakładek */}
                {hasBudgetInDB && activeTab === 'transfers' && (
                    <div className="space-y-6">
                        {/* Pola przychodu */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Przychody miesięczne</h3>
                                <button
                                    onClick={() => setShowNewIncomeForm(true)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Dodaj przychód
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mój przychód</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={monthlyIncomes.myIncome || ''}
                                        onChange={(e) => {
                                            const newIncomes = { ...monthlyIncomes, myIncome: parseFloat(e.target.value) || 0 };
                                            saveMonthlyIncomes(newIncomes);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Przychód Ani</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={monthlyIncomes.spouseIncome || ''}
                                        onChange={(e) => {
                                            const newIncomes = { ...monthlyIncomes, spouseIncome: parseFloat(e.target.value) || 0 };
                                            saveMonthlyIncomes(newIncomes);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            
                            {/* Podsumowanie przychodów */}
                            <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-green-800">Łączny przychód:</span>
                                    <span className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabela przelewów */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Planowane przelewy i wydatki</h3>
                                <button
                                    onClick={() => setShowNewTransferForm(true)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Dodaj pozycję
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-medium text-gray-900">Nazwa</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900">Bank/Źródło</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900">Opis</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-900">Kwota</th>
                                            <th className="text-center py-3 px-4 font-medium text-gray-900">Akcje</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allTransferItems.map((item, index) => (
                                            <tr key={item.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.bank}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.description}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={monthlyTransfers[item.name] || item.defaultAmount || 0}
                                                        onChange={(e) => {
                                                            const newTransfers = { 
                                                                ...monthlyTransfers, 
                                                                [item.name]: parseFloat(e.target.value) || 0 
                                                            };
                                                            saveMonthlyTransfers(newTransfers);
                                                        }}
                                                        className="w-24 px-2 py-1 text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        {item.isBudgetable && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Budżetowalne
                                                            </span>
                                                        )}
                                                        {item.isCustom && (
                                                            <button
                                                                onClick={() => handleDeleteTransferItem(item.name, true)}
                                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                                title="Usuń pozycję"
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {!item.isCustom && !item.isBudgetable && (
                                                            <span className="text-xs text-gray-400">Sztywny wydatek</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-gray-300 bg-gray-50">
                                            <td colSpan="4" className="py-3 px-4 font-medium text-gray-900">Łączne wydatki:</td>
                                            <td className="py-3 px-4 text-right font-bold text-red-600">
                                                {formatCurrency(totalTransferExpenses)}
                                            </td>
                                        </tr>
                                        <tr className="bg-blue-50">
                                            <td colSpan="4" className="py-3 px-4 font-medium text-blue-900">Pozostaje do rozdysponowania:</td>
                                            <td className="py-3 px-4 text-right font-bold text-blue-600">
                                                {formatCurrency(remainingAfterTransfers)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Sekcja budżetowania kategorii */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Budżetowanie środków</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Podziel środki z kategorii budżetowalnych na konkretne wydatki
                            </p>
                            
                            <div className="space-y-6">
                                {Object.entries(budgetableAmounts).map(([categoryName, amount]) => (
                                    <div key={categoryName} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-md font-medium text-gray-900">{categoryName}</h4>
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-green-600">{formatCurrency(amount)}</span>
                                                <p className="text-xs text-gray-500">dostępne</p>
                                            </div>
                                        </div>
                                        
                                        {/* Pod-budżet dla tej kategorii */}
                                        <div className="space-y-2">
                                            {subBudgets[categoryName]?.map((subItem, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <span className="text-sm text-gray-700">{subItem.name}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={subItem.amount || 0}
                                                            onChange={(e) => {
                                                                const newSubBudgets = { ...subBudgets };
                                                                if (!newSubBudgets[categoryName]) newSubBudgets[categoryName] = [];
                                                                newSubBudgets[categoryName][index] = {
                                                                    ...subItem,
                                                                    amount: parseFloat(e.target.value) || 0
                                                                };
                                                                saveSubBudgets(newSubBudgets);
                                                            }}
                                                            className="w-20 px-2 py-1 text-right text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newSubBudgets = { ...subBudgets };
                                                                newSubBudgets[categoryName] = newSubBudgets[categoryName].filter((_, i) => i !== index);
                                                                saveSubBudgets(newSubBudgets);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-red-600"
                                                        >
                                                            <TrashIcon className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )) || []}
                                            
                                            {/* Przycisk dodania nowego pod-budżetu */}
                                            <button
                                                onClick={() => {
                                                    const newSubBudgets = { ...subBudgets };
                                                    if (!newSubBudgets[categoryName]) newSubBudgets[categoryName] = [];
                                                    const newName = prompt('Nazwa kategorii:');
                                                    if (newName) {
                                                        newSubBudgets[categoryName].push({ name: newName, amount: 0 });
                                                        saveSubBudgets(newSubBudgets);
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
                                            >
                                                + Dodaj kategorię
                                            </button>
                                            
                                            {/* Podsumowanie dla tej kategorii */}
                                            {subBudgets[categoryName] && (
                                                <div className="pt-2 border-t border-gray-200">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Zabudżetowano:</span>
                                                        <span className="font-medium">
                                                            {formatCurrency(subBudgets[categoryName].reduce((sum, item) => sum + (item.amount || 0), 0))}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Pozostaje:</span>
                                                        <span className={`font-medium ${
                                                            amount - subBudgets[categoryName].reduce((sum, item) => sum + (item.amount || 0), 0) >= 0 
                                                                ? 'text-green-600' 
                                                                : 'text-red-600'
                                                        }`}>
                                                            {formatCurrency(amount - subBudgets[categoryName].reduce((sum, item) => sum + (item.amount || 0), 0))}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {hasBudgetInDB && activeTab === 'budget' && (
                    <div className="space-y-6">
                        {/* 3 kafelki z pozostałymi kwotami */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {availableBudgetSources.map(source => {
                                const available = budgetableAmounts[source] || 0;
                                const used = usedFromSources[source] || 0;
                                const remaining = available - used;
                                
                                return (
                                    <div key={source} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-900">{source}</h3>
                                            <div className="text-right">
                                                <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(remaining)}
                                                </p>
                                                <p className="text-xs text-gray-500">pozostało</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-sm text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Dostępne:</span>
                                                <span>{formatCurrency(available)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Zabudżetowane:</span>
                                                <span>{formatCurrency(used)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Prosta tabela 3-kolumnowa */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium text-gray-900">Budżet kategorii na {formatMonthDisplay(selectedMonth)}</h3>
                                <button
                                    onClick={() => setShowCategoryForm(true)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Dodaj envelope
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-4 px-6 font-medium text-gray-900">Kategoria</th>
                                            <th className="text-left py-4 px-6 font-medium text-gray-900">Źródło budżetu</th>
                                            <th className="text-right py-4 px-6 font-medium text-gray-900">Kwota</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(monthlyBudgetCategories).map(([categoryName, categoryData]) => (
                                            <tr key={categoryName} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{categoryName}</div>
                                                        <div className="text-sm text-gray-500">{categoryData.description}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <select
                                                        value={categoryData.source || 'Życie'}
                                                        onChange={(e) => {
                                                            const newCategories = {
                                                                ...monthlyBudgetCategories,
                                                                [categoryName]: {
                                                                    ...categoryData,
                                                                    source: e.target.value
                                                                }
                                                            };
                                                            saveMonthlyBudgetCategories(newCategories);
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        {availableBudgetSources.map(source => (
                                                            <option key={source} value={source}>{source}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={categoryData.amount || ''}
                                                        onChange={(e) => {
                                                            const newCategories = {
                                                                ...monthlyBudgetCategories,
                                                                [categoryName]: {
                                                                    ...categoryData,
                                                                    amount: parseFloat(e.target.value) || 0
                                                                }
                                                            };
                                                            saveMonthlyBudgetCategories(newCategories);
                                                        }}
                                                        className="w-32 px-3 py-2 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>



            {/* Modal formularza nowej pozycji transferu */}
            {showNewTransferForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Dodaj nową pozycję transferu
                            </h3>
                            <form onSubmit={handleNewTransferSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nazwa pozycji</label>
                                    <input
                                        type="text"
                                        value={newTransferForm.name}
                                        onChange={(e) => setNewTransferForm({...newTransferForm, name: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="np. Nowa subskrypcja, Dodatkowe ubezpieczenie"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bank/Źródło</label>
                                    <input
                                        type="text"
                                        value={newTransferForm.bank}
                                        onChange={(e) => setNewTransferForm({...newTransferForm, bank: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="np. PKO SA, mbank, Santander"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Domyślna kwota</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newTransferForm.defaultAmount}
                                        onChange={(e) => setNewTransferForm({...newTransferForm, defaultAmount: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Opis</label>
                                    <textarea
                                        value={newTransferForm.description}
                                        onChange={(e) => setNewTransferForm({...newTransferForm, description: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        rows="3"
                                        placeholder="Opis tej pozycji budżetu"
                                    />
                                </div>
                                
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={resetNewTransferForm}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Anuluj
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    >
                                        Dodaj pozycję
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal formularza nowego envelope */}
            {showCategoryForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Dodaj envelope
                            </h3>
                            <form onSubmit={handleCreateEnvelope} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kategoria</label>
                                    <select
                                        value={newCategoryForm.name}
                                        onChange={(e) => setNewCategoryForm({...newCategoryForm, name: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="">Wybierz kategorię</option>
                                        {availableCategories.map(category => (
                                            <option key={category.id} value={category.name}>
                                                {category.name} - {category.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kwota (limit)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newCategoryForm.description}
                                        onChange={(e) => setNewCategoryForm({...newCategoryForm, description: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewCategoryForm({ name: '', description: '' });
                                            setShowCategoryForm(false);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Anuluj
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    >
                                        Dodaj envelope
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal formularza nowego przychodu */}
            {showNewIncomeForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Dodaj nowy przychód
                            </h3>
                            <form onSubmit={handleNewIncomeSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Źródło przychodu</label>
                                    <select
                                        value={newIncomeForm.source}
                                        onChange={(e) => setNewIncomeForm({...newIncomeForm, source: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="">Wybierz źródło</option>
                                        <option value="Salary Tomek">Mój przychód</option>
                                        <option value="Salary Ania">Przychód Ani</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Bonus">Bonus</option>
                                        <option value="Investment">Inwestycje</option>
                                        <option value="Other">Inne</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kwota</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newIncomeForm.amount}
                                        onChange={(e) => setNewIncomeForm({...newIncomeForm, amount: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Opis (opcjonalny)</label>
                                    <textarea
                                        value={newIncomeForm.description}
                                        onChange={(e) => setNewIncomeForm({...newIncomeForm, description: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        rows="2"
                                        placeholder="Dodatkowe informacje o przychodzie"
                                    />
                                </div>
                                
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewIncomeForm({ source: '', amount: '', description: '' });
                                            setShowNewIncomeForm(false);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Anuluj
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Dodaj przychód
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};