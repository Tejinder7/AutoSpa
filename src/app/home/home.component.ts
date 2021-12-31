import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { getFirestore, collection, addDoc, getDocs, doc, Timestamp, deleteDoc, setDoc} from '@firebase/firestore/lite'
import { getStorage, ref, uploadBytes, getDownloadURL } from '@firebase/storage'
import { DBService } from '../db.service';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  file: any;
  providersList : any;
  addView = false;
  text = "Add Providers";
  updateMode = false;

  providersForm = new FormGroup(
    {
      name : new FormControl(''),
      email : new FormControl(''),
      phone : new FormControl(''),
      address : new FormControl(''),
      pincode: new FormControl(''),
      city : new FormControl(''),
      image : new FormControl(''),
      

    }
  );

  cities = [
    {cityName: "Select City", state:""},
    {cityName: "Ludhina", state:"Punjab", pinCode: [141001, 141002, 141005]},
    {cityName: "Chadigarh", state:"Punjab"},
    {cityName: "Amritsar", state:"Punjab"},
    {cityName: "Jalandhar", state:"Punjab"},
    {cityName: "Phagwara", state:"Punjab"},
  ];

  constructor(private db: DBService, private route: ActivatedRoute) {
    this.fetchProviders();
   }

  action: String = "";
  providersData: any;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.action = params['action']
     if(this.action == "update"){  // Update Here
        this.addView = true;
        this.updateMode = true;
        this.text = "Update Restaurant";

        const sessionData = sessionStorage.getItem("restaurant");
        this.providersData = JSON.parse(sessionData!);

        this.providersForm.patchValue(
          {
            name: this.providersData.name,
            phone: this.providersData.phone
          }
        );
        
      }else{
        console.log("Do Nothing or Handle the Case");
      }
    });
  }

  async fetchProviders(){
    const firestoreDB = getFirestore(this.db.app);
    const ShowProviders = collection(firestoreDB, 'providers');
    const snapshots = await getDocs(ShowProviders);
    
    this.providersList = snapshots.docs.map(
      doc => {
          const data = doc.data();
          data['docId'] = doc.id;
          return data;
      }
    );
     
    console.log(this.providersList);

    // snapshots.docs.map(
    //   doc => console.log(doc.id)
    // );

  }

  pickFile(event:any){
    this.file = event.target.files[0];
    console.log(this.providersForm.value);
    console.log(this.file);
  }

  uploadImgeToFirebase(){
    const metadata = {
      contentType: 'image/png',
    };
    const storageReference = getStorage();
    const providersImageReference = ref(storageReference, "providers-images/"+this.file.name);
    uploadBytes(providersImageReference, this.file, metadata).then((snapshot) => {
     console.log("Image Uploaded Successfully");
     getDownloadURL(snapshot.ref).then((downloadURL) => {
      console.log('File available at', downloadURL);
      // Save Restaurant Object in FirebaseFirestore
      const dataToSave = this.providersForm.value;
      // Save this in Firebase
      dataToSave['imageUrl'] = downloadURL;
      dataToSave['creationTime'] = Timestamp.now();
      console.log("dataToSave is: "+dataToSave);

      const firestoreDB = getFirestore(this.db.app);
      
      const restaurantCollection = collection(firestoreDB, 'providers');
      addDoc(restaurantCollection, dataToSave);
      console.log("Providers Added");
      
  })
  .catch((error) =>{
    console.log("Something Went Wrong");
  }); 
    });
}

deleteProviders(docID: any){
  console.log("Delete Clicked");
  const firestoreDB = getFirestore(this.db.app);
  deleteDoc(doc(firestoreDB, "providers", docID));
}

updateProviders(docID: any){

if(this.providersForm.value.image != ""){
  // Upload the Image
}

const firestoreDB = getFirestore(this.db.app);
const documentToWrite = doc(firestoreDB, 'providers', docID);
const restaurantData = this.providersForm.value;
console.log("Updating Providers with Data:");
console.log(restaurantData);


setDoc(documentToWrite, restaurantData);
}


addProvidersToFirebase(){

if(this.updateMode){
  this.updateProviders(this.providersData.docId);
  return;
}

console.log(this.providersForm.value);

//1. Firstly, Upload the Image in Firebase Storage
//   After Image is uploaded we will get image download URL
//   in the form data, image FormControl value should be updated with download URL
//2. Save Data in Firebase

// 1. Uplaod Image
this.uploadImgeToFirebase();

// 2. Save the Data
// Divide the logic and execute the functions accordingly
}

changeView(){
  this.addView = !this.addView;
  if(this.addView){
    this.text = "View Providers";
  }else{
    this.text = "Add Providers";
  }
}

saveDataInSession(providers: any){
  console.log(providers);
  sessionStorage.setItem("providers", JSON.stringify(providers));
  console.log("Provider Saved in Session Storage");
}

}
