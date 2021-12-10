import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { DBService } from '../db.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.css']
})
export class AuthenticateComponent implements OnInit {

  authForm= new FormGroup(
    {
      email: new FormControl(),
      password: new FormControl()

    }
  );

  constructor(db: DBService) { 
    
    
  }

  ngOnInit(): void {
  }

  registerUser(){
    const auth= getAuth()
    createUserWithEmailAndPassword(auth, this.authForm.value.email, this.authForm.value.password)
    .then((userCredential)=>{
      console.log("User Created Successfully");
      
    })
    .catch((error)=>{
      console.log("Something went wrong");
      
    })
    
  }

}
