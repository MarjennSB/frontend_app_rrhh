const fs = require('fs');
const path = require('path');

const mainEntities = [
  { name: 'Person', file: 'person', model: 'Person' },
  { name: 'Personal', file: 'personal', model: 'Personal' },
  { name: 'Attendance', file: 'attendance', model: 'Attendance' },
  { name: 'Contract', file: 'contract', model: 'Contract' },
  { name: 'Vacation', file: 'vacation', model: 'Vacation' },
  { name: 'Incident', file: 'incident', model: 'Incident' },
  { name: 'PersonalDocument', file: 'personal-document', model: 'PersonalDocument' },
  { name: 'PositionHistory', file: 'position-history', model: 'PositionHistory' }
];

const dir = 'c:\\xampp\\htdocs\\RRHH\\frontend_app_rrhh\\src\\app\\core\\services';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

for (const entity of mainEntities) {
  const content = `import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ${entity.model} } from '../models/${entity.file}.model';

@Injectable({ providedIn: 'root' })
export class ${entity.name}Service {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = \`\${environment.apiUrl}/${entity.file}s\`;

  getAll(): Observable<${entity.model}[]> {
    return this.http.get<${entity.model}[]>(\`\${this.baseUrl}\`);
  }

  getById(id: number | string): Observable<${entity.model}> {
    return this.http.get<${entity.model}>(\`\${this.baseUrl}/\${id}\`);
  }

  create(data: Partial<${entity.model}>): Observable<${entity.model}> {
    return this.http.post<${entity.model}>(\`\${this.baseUrl}\`, data);
  }

  update(id: number | string, data: Partial<${entity.model}>): Observable<${entity.model}> {
    return this.http.patch<${entity.model}>(\`\${this.baseUrl}/\${id}\`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(\`\${this.baseUrl}/\${id}\`);
  }
}
`;
  fs.writeFileSync(path.join(dir, `${entity.file}.service.ts`), content);
}
console.log('Main services created successfully.');
