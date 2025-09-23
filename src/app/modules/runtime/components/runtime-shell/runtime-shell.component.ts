import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Page } from '../../../../shared/models/page.model';
import { ComponentInstance } from '../../../../shared/models/component-instance.model';
import { BuilderApiService } from '../../../../shared/services/builder-api.service';
import { FilterService } from '../../../../shared/services/filter.service';

interface RuntimeViewModel {
  page: Page | null;
  components: ComponentInstance[];
}

@Component({
  selector: 'app-runtime-shell',
  templateUrl: './runtime-shell.component.html',
  styleUrls: ['./runtime-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuntimeShellComponent implements OnInit {
  vm$!: Observable<RuntimeViewModel>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: BuilderApiService,
    private readonly filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.vm$ = this.route.paramMap.pipe(
      map((params) => params.get('pageId') ?? 'default-page'),
      switchMap((pageId) => this.api.getPage(pageId)),
      tap((page) => {
        const definitions = page?.layout.filterBar?.definitions ?? [];
        if (definitions.length) {
          this.filterService.registerDefinitions(definitions);
        }
      }),
      map((page) => ({
        page,
        components: page?.layout.components ?? [],
      }))
    );
  }
}
