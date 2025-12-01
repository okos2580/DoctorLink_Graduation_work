import sql from 'mssql';
import { getPool } from '../config/database';
import { Hospital, HospitalStatus, HospitalFilter, PaginationQuery, SearchOptions } from '../types';

export class HospitalModel {
  // 병원 생성
  static async create(hospitalData: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt' | 'registrationDate' | 'lastUpdated' | 'rating' | 'reviewCount'>): Promise<Hospital> {
    const pool = getPool();
    const request = pool.request();

    const query = `
      INSERT INTO Hospitals (
        name, address, phone, email, website, type, departments, 
        operatingHours, status, description, facilities, latitude, longitude, image
      )
      OUTPUT INSERTED.*
      VALUES (
        @name, @address, @phone, @email, @website, @type, @departments,
        @operatingHours, @status, @description, @facilities, @latitude, @longitude, @image
      )
    `;

    request.input('name', sql.NVarChar, hospitalData.name);
    request.input('address', sql.NVarChar, hospitalData.address);
    request.input('phone', sql.NVarChar, hospitalData.phone);
    request.input('email', sql.NVarChar, hospitalData.email || null);
    request.input('website', sql.NVarChar, hospitalData.website || null);
    request.input('type', sql.NVarChar, hospitalData.type);
    request.input('departments', sql.NVarChar, JSON.stringify(hospitalData.departments));
    request.input('operatingHours', sql.NVarChar, JSON.stringify(hospitalData.operatingHours));
    request.input('status', sql.NVarChar, hospitalData.status || 'pending');
    request.input('description', sql.NVarChar, hospitalData.description || null);
    request.input('facilities', sql.NVarChar, JSON.stringify(hospitalData.facilities));
    request.input('latitude', sql.Decimal(10, 8), hospitalData.latitude || null);
    request.input('longitude', sql.Decimal(11, 8), hospitalData.longitude || null);
    request.input('image', sql.NVarChar, hospitalData.image || null);

    const result = await request.query(query);
    const hospital = result.recordset[0];
    
    // JSON 필드 파싱
    return this.parseJsonFields(hospital);
  }

  // ID로 병원 찾기
  static async findById(id: string): Promise<Hospital | null> {
    const pool = getPool();
    const request = pool.request();

    const query = `SELECT * FROM Hospitals WHERE id = @id`;
    request.input('id', sql.UniqueIdentifier, id);

    const result = await request.query(query);
    const hospital = result.recordset[0];
    
    return hospital ? this.parseJsonFields(hospital) : null;
  }

  // 병원 목록 조회 (필터링 및 페이지네이션)
  static async findMany(
    filter: HospitalFilter = {},
    pagination: PaginationQuery = {}
  ): Promise<{ hospitals: Hospital[]; total: number }> {
    const pool = getPool();
    const request = pool.request();

    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let countWhereClause = 'WHERE 1=1';

    // 필터 조건 추가
    if (filter.status) {
      whereClause += ' AND status = @status';
      countWhereClause += ' AND status = @status';
      request.input('status', sql.NVarChar, filter.status);
    }

    if (filter.type) {
      whereClause += ' AND type = @type';
      countWhereClause += ' AND type = @type';
      request.input('type', sql.NVarChar, filter.type);
    }

    if (filter.searchTerm) {
      whereClause += ' AND (name LIKE @searchTerm OR address LIKE @searchTerm OR description LIKE @searchTerm)';
      countWhereClause += ' AND (name LIKE @searchTerm OR address LIKE @searchTerm OR description LIKE @searchTerm)';
      request.input('searchTerm', sql.NVarChar, `%${filter.searchTerm}%`);
    }

    if (filter.department) {
      whereClause += ' AND departments LIKE @department';
      countWhereClause += ' AND departments LIKE @department';
      request.input('department', sql.NVarChar, `%"${filter.department}"%`);
    }

    // 위치 기반 필터링
    if (filter.latitude && filter.longitude && filter.radius) {
      const radiusInKm = filter.radius;
      whereClause += ` AND (
        6371 * ACOS(
          COS(RADIANS(@latitude)) * COS(RADIANS(latitude)) * 
          COS(RADIANS(longitude) - RADIANS(@longitude)) + 
          SIN(RADIANS(@latitude)) * SIN(RADIANS(latitude))
        )
      ) <= @radius`;
      countWhereClause += ` AND (
        6371 * ACOS(
          COS(RADIANS(@latitude)) * COS(RADIANS(latitude)) * 
          COS(RADIANS(longitude) - RADIANS(@longitude)) + 
          SIN(RADIANS(@latitude)) * SIN(RADIANS(latitude))
        )
      ) <= @radius`;
      
      request.input('latitude', sql.Decimal(10, 8), filter.latitude);
      request.input('longitude', sql.Decimal(11, 8), filter.longitude);
      request.input('radius', sql.Float, radiusInKm);
    }

    // 전체 개수 조회
    const countQuery = `SELECT COUNT(*) as total FROM Hospitals ${countWhereClause}`;
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // 병원 목록 조회
    let orderByClause = `ORDER BY ${sortBy} ${sortOrder}`;
    
    // 거리순 정렬인 경우
    if (sortBy === 'distance' && filter.latitude && filter.longitude) {
      orderByClause = `ORDER BY (
        6371 * ACOS(
          COS(RADIANS(@latitude)) * COS(RADIANS(latitude)) * 
          COS(RADIANS(longitude) - RADIANS(@longitude)) + 
          SIN(RADIANS(@latitude)) * SIN(RADIANS(latitude))
        )
      ) ASC`;
    }

    const query = `
      SELECT *, 
      ${filter.latitude && filter.longitude ? `
        (6371 * ACOS(
          COS(RADIANS(@latitude)) * COS(RADIANS(latitude)) * 
          COS(RADIANS(longitude) - RADIANS(@longitude)) + 
          SIN(RADIANS(@latitude)) * SIN(RADIANS(latitude))
        )) as distance
      ` : 'NULL as distance'}
      FROM Hospitals 
      ${whereClause}
      ${orderByClause}
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const result = await request.query(query);
    const hospitals = result.recordset.map((hospital: any) => this.parseJsonFields(hospital));

    return { hospitals, total };
  }

  // 병원 검색
  static async search(options: SearchOptions): Promise<Hospital[]> {
    const pool = getPool();
    const request = pool.request();

    let whereClause = 'WHERE status = \'active\'';
    
    if (options.keyword) {
      whereClause += ' AND (name LIKE @keyword OR address LIKE @keyword OR description LIKE @keyword)';
      request.input('keyword', sql.NVarChar, `%${options.keyword}%`);
    }

    if (options.type) {
      whereClause += ' AND type = @type';
      request.input('type', sql.NVarChar, options.type);
    }

    if (options.category) {
      whereClause += ' AND departments LIKE @category';
      request.input('category', sql.NVarChar, `%"${options.category}"%`);
    }

    let orderByClause = 'ORDER BY rating DESC, reviewCount DESC';
    
    if (options.sort === 'distance' && options.latitude && options.longitude) {
      orderByClause = `ORDER BY (
        6371 * ACOS(
          COS(RADIANS(@latitude)) * COS(RADIANS(latitude)) * 
          COS(RADIANS(longitude) - RADIANS(@longitude)) + 
          SIN(RADIANS(@latitude)) * SIN(RADIANS(latitude))
        )
      ) ASC`;
      
      request.input('latitude', sql.Decimal(10, 8), options.latitude);
      request.input('longitude', sql.Decimal(11, 8), options.longitude);
      
      if (options.radius) {
        whereClause += ` AND (
          6371 * ACOS(
            COS(RADIANS(@latitude)) * COS(RADIANS(latitude)) * 
            COS(RADIANS(longitude) - RADIANS(@longitude)) + 
            SIN(RADIANS(@latitude)) * SIN(RADIANS(latitude))
          )
        ) <= @radius`;
        request.input('radius', sql.Float, options.radius);
      }
    } else if (options.sort === 'name') {
      orderByClause = 'ORDER BY name ASC';
    }

    const query = `
      SELECT TOP (@limit) *,
      ${options.latitude && options.longitude ? `
        (6371 * ACOS(
          COS(RADIANS(@latitude)) * COS(RADIANS(latitude)) * 
          COS(RADIANS(longitude) - RADIANS(@longitude)) + 
          SIN(RADIANS(@latitude)) * SIN(RADIANS(latitude))
        )) as distance
      ` : 'NULL as distance'}
      FROM Hospitals 
      ${whereClause}
      ${orderByClause}
    `;

    request.input('limit', sql.Int, options.limit || 20);

    const result = await request.query(query);
    return result.recordset.map((hospital: any) => this.parseJsonFields(hospital));
  }

  // 병원 정보 업데이트
  static async update(id: string, updateData: Partial<Hospital>): Promise<Hospital | null> {
    const pool = getPool();
    const request = pool.request();

    const updateFields: string[] = [];
    const allowedFields = [
      'name', 'address', 'phone', 'email', 'website', 'type', 'departments',
      'operatingHours', 'status', 'description', 'facilities', 'latitude', 'longitude', 'image'
    ];

    // 업데이트할 필드 동적 생성
    allowedFields.forEach(field => {
      if (updateData[field as keyof Hospital] !== undefined) {
        updateFields.push(`${field} = @${field}`);
        
        // JSON 필드 처리
        if (['departments', 'operatingHours', 'facilities'].includes(field)) {
          request.input(field, sql.NVarChar, JSON.stringify(updateData[field as keyof Hospital]));
        } else {
          request.input(field, sql.NVarChar, updateData[field as keyof Hospital]);
        }
      }
    });

    if (updateFields.length === 0) {
      throw new Error('업데이트할 필드가 없습니다.');
    }

    const query = `
      UPDATE Hospitals 
      SET ${updateFields.join(', ')}, lastUpdated = GETDATE(), updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id
    `;

    request.input('id', sql.UniqueIdentifier, id);

    const result = await request.query(query);
    const hospital = result.recordset[0];
    
    return hospital ? this.parseJsonFields(hospital) : null;
  }

  // 병원 삭제 (소프트 삭제)
  static async delete(id: string): Promise<boolean> {
    const pool = getPool();
    const request = pool.request();

    const query = `
      UPDATE Hospitals 
      SET status = 'inactive', updatedAt = GETDATE()
      WHERE id = @id
    `;

    request.input('id', sql.UniqueIdentifier, id);

    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  }

  // 병원 평점 업데이트
  static async updateRating(id: string): Promise<boolean> {
    const pool = getPool();
    const request = pool.request();

    const query = `
      UPDATE Hospitals 
      SET 
        rating = (
          SELECT COALESCE(AVG(CAST(rating as FLOAT)), 0) 
          FROM Reviews 
          WHERE hospitalId = @id
        ),
        reviewCount = (
          SELECT COUNT(*) 
          FROM Reviews 
          WHERE hospitalId = @id
        ),
        updatedAt = GETDATE()
      WHERE id = @id
    `;

    request.input('id', sql.UniqueIdentifier, id);

    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  }

  // 근처 병원 찾기
  static async findNearby(
    latitude: number, 
    longitude: number, 
    radius: number = 10, 
    limit: number = 10
  ): Promise<Hospital[]> {
    const pool = getPool();
    const request = pool.request();

    const query = `
      SELECT TOP (@limit) *,
      (6371 * ACOS(
        COS(RADIANS(@latitude)) * COS(RADIANS(latitude)) * 
        COS(RADIANS(longitude) - RADIANS(@longitude)) + 
        SIN(RADIANS(@latitude)) * SIN(RADIANS(latitude))
      )) as distance
      FROM Hospitals 
      WHERE status = 'active'
      AND latitude IS NOT NULL 
      AND longitude IS NOT NULL
      AND (6371 * ACOS(
        COS(RADIANS(@latitude)) * COS(RADIANS(latitude)) * 
        COS(RADIANS(longitude) - RADIANS(@longitude)) + 
        SIN(RADIANS(@latitude)) * SIN(RADIANS(latitude))
      )) <= @radius
      ORDER BY distance ASC
    `;

    request.input('latitude', sql.Decimal(10, 8), latitude);
    request.input('longitude', sql.Decimal(11, 8), longitude);
    request.input('radius', sql.Float, radius);
    request.input('limit', sql.Int, limit);

    const result = await request.query(query);
    return result.recordset.map((hospital: any) => this.parseJsonFields(hospital));
  }

  // 인기 병원 조회
  static async getPopular(limit: number = 10): Promise<Hospital[]> {
    const pool = getPool();
    const request = pool.request();

    const query = `
      SELECT TOP (@limit) * 
      FROM Hospitals 
      WHERE status = 'active'
      ORDER BY rating DESC, reviewCount DESC
    `;

    request.input('limit', sql.Int, limit);

    const result = await request.query(query);
    return result.recordset.map((hospital: any) => this.parseJsonFields(hospital));
  }

  // JSON 필드 파싱 헬퍼 메서드
  private static parseJsonFields(hospital: any): Hospital {
    if (!hospital) return hospital;

    try {
      if (hospital.departments && typeof hospital.departments === 'string') {
        hospital.departments = JSON.parse(hospital.departments);
      }
      if (hospital.operatingHours && typeof hospital.operatingHours === 'string') {
        hospital.operatingHours = JSON.parse(hospital.operatingHours);
      }
      if (hospital.facilities && typeof hospital.facilities === 'string') {
        hospital.facilities = JSON.parse(hospital.facilities);
      }
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
    }

    return hospital;
  }

  // 부서별 병원 수 조회
  static async countByDepartment(): Promise<Array<{ department: string; count: number }>> {
    const pool = getPool();
    const request = pool.request();

    const query = `
      SELECT departments 
      FROM Hospitals 
      WHERE status = 'active' AND departments IS NOT NULL
    `;

    const result = await request.query(query);
    const departmentCounts: { [key: string]: number } = {};

    result.recordset.forEach((row: any) => {
      try {
        const departments = JSON.parse(row.departments);
        departments.forEach((dept: string) => {
          departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
        });
      } catch (error) {
        console.error('부서 데이터 파싱 오류:', error);
      }
    });

    return Object.entries(departmentCounts)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);
  }
}
