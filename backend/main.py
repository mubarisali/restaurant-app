import json
import threading
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Literal, Optional
from pydantic import BaseModel, Field

app = FastAPI(title="Restaurant API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    # Any port on localhost / 127.0.0.1 / private LAN IPs, so the site works however it's opened in dev
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Models ----------
class MenuItem(BaseModel):
    id: int
    name: str
    description: str
    price: float
    image: str
    rating: float
    calories: int
    isVeg: bool
    isBestseller: bool
    isSpicy: bool
    subcategory: Optional[str] = None

class Category(BaseModel):
    id: str
    name: str
    icon: str
    type: str  # "veg" | "nonveg"
    subcategories: List[str]
    items: List[MenuItem]

class FeedbackIn(BaseModel):
    itemId: Optional[int] = None  # None = feedback about the restaurant overall
    name: str = Field(min_length=1, max_length=40)
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=500)

class Restaurant(BaseModel):
    name: str
    tagline: str
    address: str
    phone: str
    rating: float
    totalReviews: int
    openTime: str
    closeTime: str

# ---------- Data ----------
restaurant_info = {
    "name": "Spice Garden",
    "tagline": "Where Every Bite Tells a Story",
    "address": "123, MG Road, Bangalore, Karnataka - 560001",
    "phone": "+91 98765 43210",
    "rating": 4.7,
    "totalReviews": 2840,
    "openTime": "11:00 AM",
    "closeTime": "11:00 PM",
}


def img(photo_id: str) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?w=400&q=80"


# Reusable dish photos
IMG = {
    "chicken_biryani": img("1563379091339-03b21ab4a4f8"),
    "mutton_biryani": img("1589302168068-964664d93dc0"),
    "prawn_biryani": img("1676037150408-4b59a542fa7c"),
    "veg_biryani": "/images/veg_biryani.jpg",
    "curry": img("1565557623262-b51c2513a641"),
    "butter_chicken": img("1588166524941-3bf61a9c41db"),
    "rogan_josh": img("1574653853027-5382a3d23a15"),
    "keema": img("1631452180519-c014fe946bc7"),
    "fish_curry": img("1626200419199-391ae4be7a41"),
    "prawn_masala": img("1585937421612-70a008356fbe"),
    "dal": img("1546833999-b9f581a1996d"),
    "palak": img("1601050690597-df0568f70950"),
    "kadai_paneer": img("1567188040759-fb8a883dc6d8"),
    "fry": img("1606491956689-2ea866880c84"),
    "manchurian": img("1603133872878-684f208fb84b"),
    "mushroom": img("1559314809-0d155014e29e"),
    "tikka": img("1599487488170-d11ec9c172f0"),
    "kebab": img("1529694157872-4e0c0f3b238b"),
    "grilled_fish": img("1512058556646-c4da40fba323"),
    "rice": img("1516684732162-798a0062be99"),
    "naan": "/images/naan.jpg",
    "garlic_naan": img("1626082927389-6cd097cdc6ec"),
    "gulab_jamun": "/images/gulab_jamun.jpg",
    "kheer": "/images/kheer.jpg",
    "rasmalai": "/images/rasmalai.jpg",
    "lassi": "/images/lassi.jpg",
    "sharbat": img("1497534446932-c925b458314e"),
    "chai": img("1571934811356-5cc061b6821f"),
    # Local photos served by the frontend from public/images (Wikimedia Commons)
    "mandhi": "/images/mandhi.jpg",
    "mandhi2": "/images/mandhi2.jpg",
    "parotta": "/images/parotta.jpg",
    "appam": "/images/appam.jpg",
    "ghee_rice": "/images/ghee_rice.jpg",
}


def dish(id, sub, name, description, price, image, rating, calories,
         veg=False, best=False, spicy=False):
    return {
        "id": id,
        "subcategory": sub,
        "name": name,
        "description": description,
        "price": price,
        "image": IMG[image],
        "rating": rating,
        "calories": calories,
        "isVeg": veg,
        "isBestseller": best,
        "isSpicy": spicy,
    }


SUBCATEGORY_ORDER = ["Biryani", "Mandhi", "Rice", "Fry", "Curry", "Roast",
                     "Breads", "Desserts", "Drinks"]

menu_data = [
    {
        "id": "chicken",
        "name": "Chicken",
        "icon": "🍗",
        "type": "nonveg",
        "items": [
            dish(101, "Biryani", "Chicken Dum Biryani", "Aromatic basmati rice layered with tender chicken, saffron & fried onions. Slow-cooked dum style.", 299, "chicken_biryani", 4.9, 650, best=True, spicy=True),
            dish(102, "Biryani", "Malabar Chicken Biryani", "Kerala-style biryani with short-grain kaima rice, ghee, cashews & raisins.", 289, "chicken_biryani", 4.8, 620),
            dish(103, "Biryani", "Hyderabadi Chicken Biryani", "Kacchi-style biryani with marinated chicken, mint & fiery green chillies.", 319, "chicken_biryani", 4.7, 680, spicy=True),
            dish(104, "Mandhi", "Chicken Mandhi", "Arabian smoked rice with tender slow-roasted chicken, served with mayo & spicy tomato chutney.", 349, "mandhi", 4.8, 720, best=True),
            dish(105, "Mandhi", "Al Faham Mandhi", "Mandhi rice topped with charcoal-grilled Arabic-spiced Al Faham chicken.", 379, "mandhi2", 4.7, 760),
            dish(106, "Mandhi", "Chicken Mandhi Family Platter", "Full chicken on a large mandhi rice platter. Serves 3–4.", 999, "mandhi", 4.9, 2400),
            dish(107, "Rice", "Chicken Fried Rice", "Wok-tossed basmati rice with shredded chicken, egg, spring onion & soy.", 219, "rice", 4.5, 540),
            dish(108, "Rice", "Chicken Schezwan Fried Rice", "Indo-Chinese fried rice in spicy schezwan sauce with chicken.", 239, "rice", 4.4, 560, spicy=True),
            dish(109, "Fry", "Chicken 65", "Crispy deep-fried chicken bites tossed in curry leaves, chillies & spices.", 229, "fry", 4.8, 450, best=True, spicy=True),
            dish(110, "Fry", "Kerala Chicken Fry", "Coconut-oil fried chicken with shallots, curry leaves & black pepper.", 249, "fry", 4.6, 480, spicy=True),
            dish(111, "Fry", "Chicken Lollipop", "Frenched chicken wings, batter-fried and served with schezwan dip.", 259, "manchurian", 4.5, 500),
            dish(112, "Curry", "Butter Chicken", "Tandoori chicken simmered in a velvety tomato, butter & cream gravy.", 279, "butter_chicken", 4.9, 590, best=True),
            dish(113, "Curry", "Chicken Curry", "Home-style chicken curry with onion, tomato & freshly ground masala.", 249, "curry", 4.6, 520, spicy=True),
            dish(114, "Curry", "Kadai Chicken", "Chicken cooked with bell peppers & crushed kadai spices.", 269, "curry", 4.5, 530, spicy=True),
            dish(115, "Roast", "Kerala Chicken Roast", "Slow-roasted chicken in a thick, caramelised onion & spice masala.", 269, "curry", 4.7, 540, spicy=True),
            dish(116, "Roast", "Pepper Chicken Roast", "Dry roast with crushed black pepper, coconut slivers & curry leaves.", 279, "fry", 4.6, 510, spicy=True),
            dish(117, "Roast", "Chicken Tikka", "Boneless chicken marinated in yogurt & spices, roasted in the tandoor.", 289, "tikka", 4.7, 380),
        ],
    },
    {
        "id": "mutton",
        "name": "Mutton",
        "icon": "🍖",
        "type": "nonveg",
        "items": [
            dish(201, "Biryani", "Mutton Dum Biryani", "Slow-cooked tender mutton layered with fragrant basmati & saffron.", 399, "mutton_biryani", 4.9, 720, best=True, spicy=True),
            dish(202, "Biryani", "Thalassery Mutton Biryani", "Malabar-style biryani with kaima rice, ghee-fried onions & mutton.", 389, "mutton_biryani", 4.7, 700),
            dish(203, "Mandhi", "Mutton Mandhi", "Fall-off-the-bone mutton on smoky Arabian mandhi rice.", 449, "mandhi2", 4.8, 820),
            dish(204, "Rice", "Mutton Keema Rice", "Spiced minced mutton tossed with jeera rice & fresh coriander.", 319, "keema", 4.5, 640),
            dish(205, "Fry", "Mutton Pepper Fry", "Tender mutton pieces dry-fried with black pepper & shallots.", 359, "fry", 4.7, 560, spicy=True),
            dish(206, "Fry", "Mutton Chukka", "Chettinad-style dry mutton with roasted spices & curry leaves.", 369, "fry", 4.6, 570, spicy=True),
            dish(207, "Curry", "Mutton Rogan Josh", "Kashmiri curry with tender mutton in a rich, aromatic red gravy.", 349, "rogan_josh", 4.8, 610, spicy=True),
            dish(208, "Curry", "Mutton Keema Curry", "Minced mutton cooked with peas, onion & tomato masala.", 319, "keema", 4.5, 560),
            dish(209, "Roast", "Kerala Mutton Roast", "Mutton slow-roasted in a dark, spicy onion-coconut masala.", 379, "rogan_josh", 4.7, 600, spicy=True),
            dish(210, "Roast", "Seekh Kebab", "Minced mutton skewers with herbs, grilled over charcoal.", 299, "kebab", 4.6, 420),
        ],
    },
    {
        "id": "seafood",
        "name": "Seafood",
        "icon": "🦐",
        "type": "nonveg",
        "items": [
            dish(301, "Biryani", "Prawn Biryani", "Juicy prawns layered with spiced basmati rice & caramelised onions.", 379, "prawn_biryani", 4.7, 600, spicy=True),
            dish(302, "Biryani", "Fish Biryani", "Seer fish pieces cooked dum-style with fragrant rice.", 359, "prawn_biryani", 4.6, 580),
            dish(303, "Mandhi", "Fish Mandhi", "Arabian-spiced grilled fish served on smoky mandhi rice.", 399, "grilled_fish", 4.5, 640),
            dish(304, "Rice", "Prawn Fried Rice", "Wok-tossed rice with prawns, egg & spring onions.", 279, "rice", 4.5, 520),
            dish(305, "Fry", "Kerala Fish Fry", "Seer fish marinated in red chilli masala, shallow-fried in coconut oil.", 329, "grilled_fish", 4.8, 420, best=True, spicy=True),
            dish(306, "Fry", "Prawn Fry", "Crispy prawns tossed with curry leaves & green chillies.", 349, "prawn_masala", 4.6, 400, spicy=True),
            dish(307, "Curry", "Kerala Fish Curry", "Fish simmered in tangy kodampuli & coconut milk gravy.", 319, "fish_curry", 4.7, 450, spicy=True),
            dish(308, "Curry", "Prawn Masala", "Prawns cooked in a thick, spicy onion-tomato masala.", 349, "prawn_masala", 4.6, 470, spicy=True),
            dish(309, "Roast", "Prawn Roast", "Kerala-style dry prawn roast with shallots & coconut slices.", 369, "prawn_masala", 4.7, 440, spicy=True),
            dish(310, "Roast", "Grilled Fish", "Whole fish marinated in herbs & lemon, grilled to perfection.", 399, "grilled_fish", 4.6, 380),
        ],
    },
    {
        "id": "egg",
        "name": "Egg",
        "icon": "🥚",
        "type": "nonveg",
        "items": [
            dish(401, "Biryani", "Egg Biryani", "Boiled eggs roasted in masala, layered with biryani rice.", 199, "chicken_biryani", 4.5, 560),
            dish(402, "Rice", "Egg Fried Rice", "Classic fried rice with scrambled egg & vegetables.", 169, "rice", 4.4, 480),
            dish(403, "Fry", "Egg Bhurji", "Spiced scrambled eggs with onion, tomato & green chilli.", 129, "keema", 4.3, 320, spicy=True),
            dish(404, "Curry", "Egg Curry", "Boiled eggs in a rich onion-tomato gravy.", 159, "curry", 4.4, 380),
            dish(405, "Roast", "Kerala Egg Roast", "Eggs in a slow-cooked, caramelised onion masala. Best with appam.", 169, "curry", 4.6, 390, spicy=True),
        ],
    },
    {
        "id": "veg",
        "name": "Veg",
        "icon": "🥗",
        "type": "veg",
        "items": [
            dish(501, "Biryani", "Veg Dum Biryani", "Fragrant basmati rice with seasonal vegetables, saffron & mint.", 229, "veg_biryani", 4.6, 520, veg=True),
            dish(502, "Biryani", "Paneer Biryani", "Paneer cubes in spiced masala layered with basmati rice.", 259, "veg_biryani", 4.6, 580, veg=True),
            dish(503, "Biryani", "Mushroom Biryani", "Button mushrooms cooked dum-style with fragrant rice.", 239, "veg_biryani", 4.4, 500, veg=True),
            dish(504, "Mandhi", "Paneer Mandhi", "Arabian smoked rice with grilled spiced paneer & salad.", 289, "ghee_rice", 4.4, 620, veg=True),
            dish(505, "Rice", "Ghee Rice", "Kaima rice cooked in ghee with cashews, raisins & fried onions.", 149, "ghee_rice", 4.6, 450, veg=True),
            dish(506, "Rice", "Veg Fried Rice", "Wok-tossed rice with fresh vegetables & soy.", 169, "rice", 4.3, 420, veg=True),
            dish(507, "Rice", "Jeera Rice", "Basmati rice tempered with cumin & ghee.", 139, "rice", 4.4, 380, veg=True),
            dish(508, "Rice", "Steamed Rice", "Fluffy steamed basmati rice.", 99, "rice", 4.3, 300, veg=True),
            dish(509, "Fry", "Gobi 65", "Crispy cauliflower florets fried in a spicy batter.", 179, "fry", 4.5, 380, veg=True, spicy=True),
            dish(510, "Fry", "Paneer 65", "Crispy paneer cubes tossed with curry leaves & chillies.", 219, "fry", 4.6, 420, veg=True, spicy=True),
            dish(511, "Fry", "Mushroom Manchurian", "Crispy mushrooms tossed in tangy Indo-Chinese sauce.", 199, "mushroom", 4.4, 360, veg=True),
            dish(512, "Curry", "Paneer Butter Masala", "Soft paneer in a rich, creamy tomato-butter gravy.", 249, "kadai_paneer", 4.8, 540, veg=True, best=True),
            dish(513, "Curry", "Dal Makhani", "Black lentils slow-cooked overnight with butter & cream.", 199, "dal", 4.7, 420, veg=True),
            dish(514, "Curry", "Palak Paneer", "Paneer cubes in a smooth, mildly spiced spinach gravy.", 229, "palak", 4.5, 380, veg=True),
            dish(515, "Curry", "Kadai Paneer", "Paneer with bell peppers & crushed kadai masala.", 239, "kadai_paneer", 4.6, 460, veg=True, spicy=True),
            dish(516, "Roast", "Mushroom Roast", "Kerala-style mushroom roast with onion & pepper masala.", 209, "mushroom", 4.5, 340, veg=True, spicy=True),
            dish(517, "Roast", "Paneer Tikka", "Paneer & peppers marinated in spiced yogurt, roasted in the tandoor.", 249, "tikka", 4.7, 400, veg=True),
        ],
    },
    {
        "id": "breads",
        "name": "Breads",
        "icon": "🫓",
        "type": "veg",
        "items": [
            dish(601, "Breads", "Kerala Parotta", "Flaky, layered Malabar parotta.", 35, "parotta", 4.8, 260, veg=True, best=True),
            dish(602, "Breads", "Butter Naan", "Soft tandoor-baked naan brushed with butter.", 49, "naan", 4.6, 280, veg=True),
            dish(603, "Breads", "Garlic Naan", "Naan topped with garlic & coriander.", 59, "garlic_naan", 4.7, 290, veg=True),
            dish(604, "Breads", "Laccha Paratha", "Crispy multi-layered whole wheat paratha.", 55, "parotta", 4.5, 300, veg=True),
            dish(605, "Breads", "Appam (2 pcs)", "Soft, lacy fermented rice pancakes.", 49, "appam", 4.6, 220, veg=True),
        ],
    },
    {
        "id": "desserts",
        "name": "Desserts",
        "icon": "🍮",
        "type": "veg",
        "items": [
            dish(701, "Desserts", "Gulab Jamun", "Soft milk dumplings soaked in rose-cardamom syrup.", 99, "gulab_jamun", 4.8, 320, veg=True),
            dish(702, "Desserts", "Kheer", "Creamy rice pudding with saffron & nuts.", 109, "kheer", 4.6, 280, veg=True),
            dish(703, "Desserts", "Rasmalai", "Soft cheese patties in chilled saffron milk.", 129, "rasmalai", 4.7, 300, veg=True),
        ],
    },
    {
        "id": "drinks",
        "name": "Drinks",
        "icon": "🥤",
        "type": "veg",
        "items": [
            dish(801, "Drinks", "Mango Lassi", "Thick yogurt smoothie with Alphonso mango.", 99, "lassi", 4.7, 220, veg=True),
            dish(802, "Drinks", "Fresh Lime Soda", "Sweet or salted lime soda.", 69, "sharbat", 4.5, 90, veg=True),
            dish(803, "Drinks", "Rose Sharbat", "Chilled rose syrup with milk & basil seeds.", 79, "sharbat", 4.4, 150, veg=True),
            dish(804, "Drinks", "Masala Chai", "Spiced Indian tea with ginger & cardamom.", 39, "chai", 4.6, 80, veg=True),
        ],
    },
]

for _cat in menu_data:
    _subs = {item["subcategory"] for item in _cat["items"]}
    _cat["subcategories"] = [s for s in SUBCATEGORY_ORDER if s in _subs]

ALL_ITEMS = {item["id"]: (item, cat) for cat in menu_data for item in cat["items"]}

# ---------- Offers ----------
# Today's special rotates by weekday (Mon=0 … Sun=6): (item id, discount %)
DAILY_SPECIALS = {
    0: [(101, 20), (512, 15), (305, 15)],
    1: [(201, 15), (509, 20), (113, 15)],
    2: [(104, 20), (513, 15), (309, 15)],
    3: [(301, 15), (502, 20), (110, 15)],
    4: [(203, 15), (515, 15), (112, 20)],
    5: [(106, 15), (501, 20), (207, 15)],
    6: [(105, 20), (517, 15), (307, 15)],
}
DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

meals = [
    {
        "id": 901, "name": "Kerala Veg Meals", "isVeg": True, "isSpicy": False,
        "description": "Traditional banana-leaf style meals — unlimited rice with curries.",
        "includes": ["Matta Rice", "Sambar", "Rasam", "Avial", "Thoran", "Pickle", "Papad", "Payasam"],
        "price": 179, "image": IMG["dal"], "rating": 4.7, "calories": 750,
    },
    {
        "id": 902, "name": "North Indian Veg Thali", "isVeg": True, "isSpicy": False,
        "description": "A complete thali with paneer, dal & breads.",
        "includes": ["Paneer Butter Masala", "Dal Makhani", "Jeera Rice", "2 Butter Naan", "Raita", "Gulab Jamun"],
        "price": 249, "image": IMG["kadai_paneer"], "rating": 4.6, "calories": 950,
    },
    {
        "id": 903, "name": "Chicken Meals", "isVeg": False, "isSpicy": True,
        "description": "Kerala meals served with a hearty chicken curry & fry.",
        "includes": ["Matta Rice", "Chicken Curry", "Chicken Fry", "Sambar", "Thoran", "Pickle", "Papad"],
        "price": 229, "image": IMG["curry"], "rating": 4.8, "calories": 980,
    },
    {
        "id": 904, "name": "Fish Meals", "isVeg": False, "isSpicy": True,
        "description": "Rice meals with Kerala fish curry & a crispy fish fry.",
        "includes": ["Matta Rice", "Fish Curry", "Fish Fry", "Moru Curry", "Thoran", "Pickle", "Papad"],
        "price": 259, "image": IMG["fish_curry"], "rating": 4.8, "calories": 900,
    },
    {
        "id": 905, "name": "Mutton Meals", "isVeg": False, "isSpicy": True,
        "description": "Premium meals with mutton curry & pepper fry.",
        "includes": ["Jeera Rice", "Mutton Curry", "Mutton Pepper Fry", "Dal", "Salad", "Papad", "Payasam"],
        "price": 329, "image": IMG["rogan_josh"], "rating": 4.7, "calories": 1100,
    },
]
for _m in meals:
    _m["timing"] = "12:00 PM – 3:30 PM"

combos = [
    {
        "id": 951, "name": "Solo Biryani Combo", "tag": "Solo", "isVeg": False, "isSpicy": True,
        "description": "Your favourite biryani with a side & a drink.",
        "includes": ["Chicken Dum Biryani", "Chicken 65 (half)", "Raita", "Fresh Lime Soda"],
        "originalPrice": 497, "price": 399, "image": IMG["chicken_biryani"], "rating": 4.8, "calories": 1200,
    },
    {
        "id": 952, "name": "Couple Mandhi Combo", "tag": "For 2", "isVeg": False, "isSpicy": False,
        "description": "Shareable mandhi platter for two with sides.",
        "includes": ["Chicken Mandhi (2 portions)", "Chicken Lollipop", "2 Fresh Lime Soda"],
        "originalPrice": 1095, "price": 849, "image": IMG["mandhi"], "rating": 4.9, "calories": 2000,
    },
    {
        "id": 953, "name": "Family Feast", "tag": "Family Pack", "isVeg": False, "isSpicy": True,
        "description": "A grand spread for the family. Serves 4.",
        "includes": ["Chicken Dum Biryani ×2", "Mutton Biryani", "Butter Chicken", "4 Kerala Parotta", "Chicken 65", "4 Gulab Jamun"],
        "originalPrice": 2170, "price": 1699, "image": IMG["mutton_biryani"], "rating": 4.9, "calories": 4800,
    },
    {
        "id": 954, "name": "Parotta & Roast Combo", "tag": "Solo", "isVeg": False, "isSpicy": True,
        "description": "The Kerala classic — flaky parotta with spicy roast.",
        "includes": ["3 Kerala Parotta", "Kerala Chicken Roast", "Masala Chai"],
        "originalPrice": 413, "price": 329, "image": IMG["parotta"], "rating": 4.8, "calories": 1150,
    },
    {
        "id": 955, "name": "Veg Delight Combo", "tag": "Solo", "isVeg": True, "isSpicy": False,
        "description": "Wholesome vegetarian combo with dessert.",
        "includes": ["Veg Dum Biryani", "Paneer Butter Masala (half)", "2 Butter Naan", "Gulab Jamun"],
        "originalPrice": 551, "price": 429, "image": IMG["veg_biryani"], "rating": 4.6, "calories": 1300,
    },
    {
        "id": 956, "name": "Seafood Lovers Combo", "tag": "For 2", "isVeg": False, "isSpicy": True,
        "description": "A coastal feast of prawns & fish.",
        "includes": ["Prawn Biryani", "Kerala Fish Fry", "Prawn Roast", "Ghee Rice", "2 Fresh Lime Soda"],
        "originalPrice": 1564, "price": 1199, "image": IMG["prawn_biryani"], "rating": 4.7, "calories": 2300,
    },
]

for _offer in meals + combos:
    _offer.setdefault("isBestseller", False)


# ---------- Routes ----------
@app.get("/")
def root():
    return {"message": "Welcome to Spice Garden API 🌶️"}


@app.get("/api/restaurant")
def get_restaurant():
    return restaurant_info


@app.get("/api/menu")
def get_menu(diet: Optional[str] = None):
    """Full menu. Optional ?diet=veg or ?diet=nonveg filters items."""
    if diet not in ("veg", "nonveg"):
        return menu_data
    want_veg = diet == "veg"
    result = []
    for cat in menu_data:
        items = [i for i in cat["items"] if i["isVeg"] == want_veg]
        if items:
            result.append({**cat, "items": items})
    return result


@app.get("/api/menu/{category_id}")
def get_category(category_id: str):
    for cat in menu_data:
        if cat["id"] == category_id:
            return cat
    raise HTTPException(status_code=404, detail="Category not found")


@app.get("/api/menu/{category_id}/item/{item_id}")
def get_item(category_id: str, item_id: int):
    for cat in menu_data:
        if cat["id"] == category_id:
            for item in cat["items"]:
                if item["id"] == item_id:
                    return item
    raise HTTPException(status_code=404, detail="Item not found")


@app.get("/api/bestsellers")
def get_bestsellers():
    bestsellers = []
    for cat in menu_data:
        for item in cat["items"]:
            if item["isBestseller"]:
                bestsellers.append({**item, "category": cat["name"]})
    return bestsellers


@app.get("/api/specials")
def get_specials():
    weekday = date.today().weekday()
    items = []
    for item_id, discount in DAILY_SPECIALS[weekday]:
        item, cat = ALL_ITEMS[item_id]
        items.append({
            **item,
            # Separate id so the discounted special doesn't merge with the regular dish in the cart
            "id": 10000 + item_id,
            "category": cat["name"],
            "originalPrice": item["price"],
            "price": round(item["price"] * (100 - discount) / 100),
            "discount": discount,
        })
    return {"day": DAY_NAMES[weekday], "items": items}


@app.get("/api/meals")
def get_meals():
    return meals


@app.get("/api/combos")
def get_combos():
    return combos


# ---------- Feedback ----------
FEEDBACK_FILE = Path(__file__).parent / "feedback.json"
_feedback_lock = threading.Lock()


def _load_feedback() -> list:
    if FEEDBACK_FILE.exists():
        try:
            return json.loads(FEEDBACK_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return []
    return []


feedback_store: list = _load_feedback()

# Every dish, meal and combo a review can be attached to: id -> name
REVIEWABLE = {item_id: item["name"] for item_id, (item, _) in ALL_ITEMS.items()}
REVIEWABLE.update({o["id"]: o["name"] for o in meals + combos})


def _normalize_item_id(item_id: Optional[int]) -> Optional[int]:
    # Today's specials use id 10000 + dish id; reviews belong to the dish itself
    if item_id is not None and item_id >= 10000:
        return item_id - 10000
    return item_id


def _summary(reviews: list) -> dict:
    count = len(reviews)
    average = round(sum(r["rating"] for r in reviews) / count, 1) if count else 0
    return {"average": average, "count": count}


def _latest(reviews: list, limit: int) -> list:
    return sorted(reviews, key=lambda r: r["createdAt"], reverse=True)[:limit]


@app.get("/api/feedback")
def get_feedback(item_id: Optional[int] = None, general: bool = False, limit: int = 20):
    """Reviews for one dish (?item_id=), overall restaurant feedback (?general=true), or everything."""
    if item_id is not None:
        item_id = _normalize_item_id(item_id)
        reviews = [r for r in feedback_store if r["itemId"] == item_id]
    elif general:
        reviews = [r for r in feedback_store if r["itemId"] is None]
    else:
        reviews = feedback_store
    return {**_summary(reviews), "reviews": _latest(reviews, limit)}


@app.get("/api/feedback/summary")
def get_feedback_summary():
    """Average rating and review count per dish, keyed by item id."""
    grouped: dict = {}
    for r in feedback_store:
        if r["itemId"] is not None:
            grouped.setdefault(r["itemId"], []).append(r)
    return {str(k): _summary(v) for k, v in grouped.items()}


@app.post("/api/feedback", status_code=201)
def add_feedback(body: FeedbackIn):
    item_id = _normalize_item_id(body.itemId)
    if item_id is not None and item_id not in REVIEWABLE:
        raise HTTPException(status_code=404, detail="Dish not found")
    with _feedback_lock:
        review = {
            "id": max((r["id"] for r in feedback_store), default=0) + 1,
            "itemId": item_id,
            "itemName": REVIEWABLE.get(item_id, "Overall experience"),
            "name": body.name.strip(),
            "rating": body.rating,
            "comment": body.comment.strip(),
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        feedback_store.append(review)
        FEEDBACK_FILE.write_text(json.dumps(feedback_store, indent=2, ensure_ascii=False), encoding="utf-8")
    return review


# ---------- Orders ----------
ORDERS_FILE = Path(__file__).parent / "orders.json"
_orders_lock = threading.Lock()
TAX_RATE = 0.05
DELIVERY_FEE = 40
FREE_DELIVERY_ABOVE = 499
PREP_MINUTES = {"dine-in": 20, "takeaway": 25, "delivery": 40}

# Status steps per order type. Progress is simulated from elapsed time unless staff set it
# explicitly via PATCH /api/orders/{id}/status.
STATUS_FLOW = {
    "dine-in": ["placed", "preparing", "served"],
    "takeaway": ["placed", "preparing", "ready", "completed"],
    "delivery": ["placed", "preparing", "out_for_delivery", "delivered"],
}


class OrderLine(BaseModel):
    id: int
    quantity: int = Field(ge=1, le=50)


class OrderIn(BaseModel):
    customerName: str = Field(min_length=1, max_length=60)
    phone: str = Field(pattern=r"^[6-9]\d{9}$")
    orderType: Literal["dine-in", "takeaway", "delivery"]
    address: Optional[str] = Field(default=None, max_length=300)
    tableNumber: Optional[str] = Field(default=None, max_length=10)
    notes: Optional[str] = Field(default=None, max_length=300)
    items: List[OrderLine] = Field(min_length=1, max_length=50)


class StatusIn(BaseModel):
    status: str


def _load_orders() -> list:
    if ORDERS_FILE.exists():
        try:
            return json.loads(ORDERS_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return []
    return []


orders_store: list = _load_orders()


def _price_catalog() -> dict:
    """Authoritative id -> (name, price) for everything orderable, including today's specials."""
    catalog = {item_id: (item["name"], item["price"]) for item_id, (item, _) in ALL_ITEMS.items()}
    catalog.update({o["id"]: (o["name"], o["price"]) for o in meals + combos})
    for sp in get_specials()["items"]:
        catalog[sp["id"]] = (f"{sp['name']} (Today's Special)", sp["price"])
    return catalog


def _with_live_status(order: dict) -> dict:
    flow = STATUS_FLOW[order["orderType"]]
    status = order.get("manualStatus")
    if not status:
        elapsed = (datetime.now(timezone.utc) - datetime.fromisoformat(order["createdAt"])).total_seconds() / 60
        eta = order["estimatedMinutes"]
        if elapsed < 1:
            step = 0
        elif elapsed < eta * 0.7:
            step = 1
        elif elapsed < eta:
            step = 2
        else:
            step = len(flow) - 1
        status = flow[step]
    public = {k: v for k, v in order.items() if k != "manualStatus"}
    return {**public, "status": status, "steps": flow}


def _save_orders():
    ORDERS_FILE.write_text(json.dumps(orders_store, indent=2, ensure_ascii=False), encoding="utf-8")


@app.post("/api/orders", status_code=201)
def create_order(body: OrderIn):
    if body.orderType == "delivery" and not (body.address and body.address.strip()):
        raise HTTPException(status_code=422, detail="Delivery address is required")
    catalog = _price_catalog()
    lines = []
    for line in body.items:
        if line.id not in catalog:
            raise HTTPException(status_code=422, detail=f"Item {line.id} is not available")
        name, price = catalog[line.id]
        lines.append({"id": line.id, "name": name, "price": price, "quantity": line.quantity,
                      "lineTotal": price * line.quantity})
    subtotal = sum(l["lineTotal"] for l in lines)
    tax = round(subtotal * TAX_RATE)
    delivery_fee = DELIVERY_FEE if body.orderType == "delivery" and subtotal < FREE_DELIVERY_ABOVE else 0
    now = datetime.now(timezone.utc)
    with _orders_lock:
        number = 1001 + len(orders_store)
        order = {
            "orderId": f"SG-{number}",
            "customerName": body.customerName.strip(),
            "phone": body.phone,
            "orderType": body.orderType,
            "address": body.address.strip() if body.orderType == "delivery" and body.address else None,
            "tableNumber": body.tableNumber if body.orderType == "dine-in" else None,
            "notes": (body.notes or "").strip() or None,
            "items": lines,
            "subtotal": subtotal,
            "tax": tax,
            "deliveryFee": delivery_fee,
            "total": subtotal + tax + delivery_fee,
            "estimatedMinutes": PREP_MINUTES[body.orderType],
            "createdAt": now.isoformat(),
            "estimatedReadyAt": (now + timedelta(minutes=PREP_MINUTES[body.orderType])).isoformat(),
            "manualStatus": None,
        }
        orders_store.append(order)
        _save_orders()
    return _with_live_status(order)


@app.get("/api/orders/{order_id}")
def get_order(order_id: str, phone: str):
    """Track an order. The phone number used at checkout is required."""
    for order in orders_store:
        if order["orderId"].lower() == order_id.strip().lower() and order["phone"] == phone.strip():
            return _with_live_status(order)
    raise HTTPException(status_code=404, detail="Order not found. Check the order ID and phone number.")


@app.patch("/api/orders/{order_id}/status")
def set_order_status(order_id: str, body: StatusIn):
    """For restaurant staff: set an order's status manually (overrides the simulated progress)."""
    for order in orders_store:
        if order["orderId"].lower() == order_id.lower():
            if body.status not in STATUS_FLOW[order["orderType"]]:
                raise HTTPException(status_code=422, detail=f"Status must be one of {STATUS_FLOW[order['orderType']]}")
            with _orders_lock:
                order["manualStatus"] = body.status
                _save_orders()
            return _with_live_status(order)
    raise HTTPException(status_code=404, detail="Order not found")
