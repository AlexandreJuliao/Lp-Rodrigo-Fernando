import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const COLLECTION_NAME = 'properties';

export async function getProperties() {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting properties: ", error);
        return [];
    }
}

export async function getProperty(id) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("No such property!");
            return null;
        }
    } catch (error) {
        console.error("Error getting property: ", error);
        return null;
    }
}

// Backoffice functions
export async function addProperty(propertyData, imageFiles) {
    try {
        // 1. Upload Images
        const imageUrls = await Promise.all(imageFiles.map(async (file) => {
            const storageRef = ref(storage, 'property-images/' + Date.now() + '-' + file.name);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
        }));

        // 2. Save Document
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...propertyData,
            images: imageUrls,
            createdAt: new Date().toISOString()
        });

        console.log("Property written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding property: ", e);
        throw e;
    }
}

export async function deleteProperty(id) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
}
