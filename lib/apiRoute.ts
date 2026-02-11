import axios, { AxiosError } from 'axios';

axios.defaults.withCredentials = true;

interface ErrorResponse {
    message?: string;
    code?: string;
    [key: string]: any;
}

interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    code?: string;
    [key: string]: any;
}

/**
 * Handle API errors
 */
const handleApiError = async (err: AxiosError<ErrorResponse>): Promise<ErrorResponse> => {
    console.log(err?.response?.data?.message || 'Something went wrong');

    if (typeof window !== 'undefined') {
        if (err?.response?.data?.code === 'unauthorized' || err?.response?.data?.code === 'access_denied') {
            await fetch(`${window?.origin}/api/auth/logout`);
            localStorage?.setItem("x_auth_token", '');
        }
    }

    return { ...err?.response?.data };
};

const getAuthHeader = () => {
    if (typeof window === 'undefined') {
        return {};
    }
    const token = localStorage?.getItem('fabble_access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Axios request wrapper
 * @method POST
 * @param {string} url - API endpoint URL
 * @param {object} payload - Request payload
 * @returns {Promise<ApiResponse>}
 */
export const postRequest = async <T = any>(
    url: string,
    payload: Record<string, any> = {}
): Promise<ApiResponse<T>> => {
    const headers = {
        'Content-Type': 'application/json',
        credentials: 'include',
        ...getAuthHeader()
    };

    const data = await axios
        .post<ApiResponse<T>>(url, payload, { headers })
        .then(resp => resp.data)
        .catch(handleApiError);

    return data;
};

/**
 * @method PUT
 * @param {string} url - API endpoint URL
 * @param {object} payload - Request payload
 * @returns {Promise<ApiResponse>}
 */
export const putRequest = async <T = any>(
    url: string,
    payload: Record<string, any> = {}
): Promise<ApiResponse<T>> => {
    const headers = {
        'Content-Type': 'application/json',
        credentials: 'include',
        ...getAuthHeader()
    };

    const data = await axios
        .put<ApiResponse<T>>(url, payload, { headers })
        .then(resp => resp.data)
        .catch(handleApiError);

    return data;
};

/**
 * @method GET
 * @param {string} url - API endpoint URL
 * @returns {Promise<ApiResponse>}
 */
export const getRequest = async <T = any>(url: string): Promise<ApiResponse<T>> => {
    const headers = {
        credentials: 'include',
        ...getAuthHeader()
    };

    const data = await axios
        .get<ApiResponse<T>>(url, { headers })
        .then(resp => resp.data)
        .catch(handleApiError);

    return data;
};

/**
 * @method DELETE
 * @param {string} url - API endpoint URL
 * @returns {Promise<ApiResponse>}
 */
export const deleteRequest = async <T = any>(url: string): Promise<ApiResponse<T>> => {
    const headers = {
        credentials: 'include',
        ...getAuthHeader()
    };

    const data = await axios
        .delete<ApiResponse<T>>(url, { headers })
        .then(resp => resp.data)
        .catch(handleApiError);

    return data;
};
