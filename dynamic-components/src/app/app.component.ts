import { Component, ViewChild, ViewContainerRef, NgModule, Compiler, Injector, NgModuleRef } from "@angular/core";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('vc', { read: ViewContainerRef }) _container: ViewContainerRef;
  constructor(private _compiler: Compiler,
    private _injector: Injector,
    private _m: NgModuleRef<any>,
    private http: HttpClient) {
  }

  ngOnInit() {
    var components = [];
    this.http.get('http://localhost:4000/button').subscribe((component: any) => {
      components.push(this.create_dynamic(component));

      this.http.get('http://localhost:4000/keypad').subscribe((component: any) => {
        components.push(this.create_dynamic(component));

        const tmpModule = NgModule({ declarations: components })(class { });

        this._compiler.compileModuleAndAllComponentsAsync(tmpModule)
          .then((factories) => {
            console.log(factories);

            const f = factories.componentFactories[1]; // Choose the last one (the main)
            const cmpRef = f.create(this._injector, [], null, this._m);
            this._container.insert(cmpRef.hostView);
          })
      });
    });
  }

  create_dynamic(component) {
    const selector = component.selector;
    const template = component.template;
    const styles = component.styles;
    const inputs = component.inputs;

    // const code = component.code;
    // var code = `
    //   class {
    //     constructor() {
    //       console.log("oeeeeeeee");
    //     }
    //   }
    // `;
    // return Component({ selector: selector, template: template, styles: styles, inputs: inputs })(code);

    return Component({ selector: selector, template: template, styles: styles, inputs: inputs })(class {
      public myValue;

      constructor() {
        if (component.methods) {
          console.log("constructor: ", component.methods);
          console.log("constructor: ", typeof component.methods);
          var methods = JSON.parse(component.methods);
          for (const key of Object.keys(methods)) {
            console.log("key: ", methods[key]);
            const method = methods[key].method;
            const params = methods[key].params;
            this[key] = new Function(params, method);
            console.log("typeof key: ", typeof this[key]);
          }
        }
      }
    });
  }
}
