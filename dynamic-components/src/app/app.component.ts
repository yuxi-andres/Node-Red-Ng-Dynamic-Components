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
    this.http.get('http://localhost:4000/components').subscribe((component: any) => {
      const template = component.template;

      const tmpCmp = Component({ template: template })(class {
        constructor() {
          console.log("constructor");
        }

        run(p) {
          console.log("run: " + p);
        }
      });
      const tmpModule = NgModule({ declarations: [tmpCmp] })(class { });

      this._compiler.compileModuleAndAllComponentsAsync(tmpModule)
        .then((factories) => {
          const f = factories.componentFactories[0];
          const cmpRef = f.create(this._injector, [], null, this._m);
          cmpRef.instance.name = component.component_name;
          this._container.insert(cmpRef.hostView);
        })
    });
  }
}
