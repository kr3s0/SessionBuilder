import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { City } from './City';
import { Country } from './../countries/Country';
import { CityService } from './city.service';
import { ApiResult } from '../base.service';

import { BaseFormComponent } from './../base.form.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.css']
})
export class CityEditComponent extends BaseFormComponent implements OnInit, OnDestroy {
  title: string;
  form: FormGroup;
  city: City;
  // the city object id, as fetched from the active route:
  // It's NULL when we're adding a new city,
  // and not NULL when we're editing an existing one.
  id?: number;
  // the countries array for the select
  countries: Country[];

  // Activity Log (for debugging purposes)
  activityLog: string = '';
  private subscriptions: Subscription = new Subscription();

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private cityService: CityService) {
    super();
  }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      lat: new FormControl('', [Validators.required, Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/)]),
      lon: new FormControl('', [Validators.required, Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/)]),
      countryId: new FormControl('', Validators.required)
    }, null, this.isDupeCity());

    // react to form changes
    this.subscriptions.add(this.form.valueChanges
      .subscribe(() => {
        if (!this.form.dirty) {
          this.log("Form Model has been loaded.");
        }
        else {
          this.log("Form was updated by the user.");
        }
      }));

    // react to changes in the form.name control
    this.subscriptions.add(this.form.get("name")!.valueChanges
      .subscribe(() => {
        if (!this.form.dirty) {
          this.log("Name has been loaded with initial values.");
        }
        else {
          this.log("Name was updated by the user.");
        }
      }));

    this.loadData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  log(str: string) {
    this.activityLog += "[" // Ovdje smo mogli koristiti i obicni console.log sto je i bolje. Ali za sada ovako zbog nekih drugih stvari
      + new Date().toLocaleString()
      + "] " + str + "<br />";
  }

  loadData() {
    // load countries
    this.loadCountries();
    // retrieve the ID from the 'id'
    this.id = +this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id) {
      // EDIT MODE
      // fetch the city from the server

      this.cityService.get<City>(this.id).subscribe(result => {
        this.city = result;
        this.title = "Edit - " + this.city.name;

        // update the form with the city value
        this.form.patchValue(this.city);
      }, error => console.error(error));
    }
    else {
      // ADD NEW MODE
      this.title = "Create a new City";
    }
  }

  loadCountries() {
    // fetch all the countries from the server
    this.cityService.getCountries<ApiResult<Country>>(
      0,
      9999,
      "name",
      null,
      null,
      null)
      .subscribe(result => {
        this.countries = result.data
      }, error => console.error(error));
  }

  onSubmit() {
    var city = (this.id) ? this.city : <City>{};
    city.name = this.form.get("name").value;
    city.lat = +this.form.get("lat").value;
    city.lon = +this.form.get("lon").value;

    city.countryId = +this.form.get("countryId").value;

    if (this.id) {
      // EDIT mode
      this.cityService
        .put<City>(city)
        .subscribe(result => {
          console.log("City " + city.id + " has been updated.");
          // go back to cities view
          this.router.navigate(['/cities']);
        }, error => console.error(error));
    }
    else {
      // ADD NEW mode
      this.cityService
        .post<City>(city)
        .subscribe(result => {
          console.log("City " + result.id + " has been created.");
          // go back to cities view
          this.router.navigate(['/cities']);
        }, error => console.error(error));
    }
  }

  isDupeCity(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      var city = <City>{};
      city.id = (this.id) ? this.id : 0;
      city.name = this.form.get("name").value;
      city.lat = +this.form.get("lat").value;
      city.lon = +this.form.get("lon").value;
      city.countryId = +this.form.get("countryId").value;
      return this.cityService.isDupeCity(city)
        .pipe(map(result => {
          return (result ? { isDupeCity: true } : null);
        })); /*We should use the subscribe() method when we want to execute the Observable and 
        get its actual result; for example, a JSON structured response.Such a method returns
        a Subscription that can be canceled but can't be subscribed to anymore.We should use the map() operator when we want to transform/manipulate the data
        events of the Observable without executing it so that it can be passed to other async
        actors that will also manipulate (and eventually execute) it. Such a method returns an
        Observable that can be subscribed to. As for the pipe(), it's just an RxJS operator that composes/chains other operators (such as map,
        filter, and so on).*/
    }
  }
}
